// controllers/quizController.js
const mongoose = require("mongoose");
const QuizAttempt = require("../models/QuizAttempt");
const { Content } = require("../models/materialModel");
const Counter = require("../models/Counter");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const round2 = (n) => Math.round(n * 100) / 100;
const parsePageLimit = (q) => {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(q.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
const isTeacherAdmin = (user) => {
  const r = (user?.role || "").toLowerCase();
  return r === "teacher" || r === "admin";
};

// Prefer q.correctIndex, fallback to legacy fields
function getCorrectIndex(q) {
  const v = q?.correctIndex ?? q?.answerIndex ?? q?.answer_index ?? q?.meta?.answerIndex;
  return Number.isFinite(Number(v)) ? Number(v) : undefined;
}

/* ------------------------- attempt counter helpers ------------------------- */
function counterKey(qid, uid) {
  return `${qid}:${uid}`;
}

// If you already have historical attempts, initialize counter to current max so the next is +1
async function ensureCounterInitialized(qid, uid) {
  const key = counterKey(qid, uid);
  const existing = await Counter.findOne({ key }).lean();
  if (existing) return;

  const last = await QuizAttempt
    .findOne({ quiz: qid, student: uid })
    .sort({ attemptNumber: -1 })
    .select("attemptNumber")
    .lean();
  const currentMax = last?.attemptNumber || 0;

  await Counter.findOneAndUpdate(
    { key },
    { $setOnInsert: { seq: currentMax } },
    { upsert: true, new: true }
  );
}

async function nextAttemptNo(qid, uid) {
  const key = counterKey(qid, uid);
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  ).lean();
  return doc.seq; // 1, 2, 3, ...
}

/* --------------------------------- routes --------------------------------- */

// POST /api/quiz/:quizId/attempts
exports.submitAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers = [], startedAt } = req.body; // [selectedIndex,...] OR [{selectedIndex}, ...]
    if (!isValidObjectId(quizId)) return res.status(400).json({ message: "Invalid quizId" });
    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });
    if (!Array.isArray(answers)) return res.status(400).json({ message: "answers must be an array" });

    // Preloaded by router.param or fetch here
    const quiz = req.quiz || (await Content.findById(quizId).lean());
    if (!quiz || quiz.type !== "quiz") return res.status(404).json({ message: "Quiz not found" });

    // Expiry guard
    const rawExpires = quiz.expiresAt || quiz?.meta?.expiresAt || null;
    if (rawExpires) {
      const expiresAt = new Date(rawExpires);
      if (!Number.isNaN(expiresAt.getTime()) && expiresAt < new Date()) {
        return res.status(400).json({ message: "Quiz has expired." });
      }
    }

    // Questions source
    const questions = Array.isArray(quiz.questions)
      ? quiz.questions
      : Array.isArray(quiz?.meta?.questions)
      ? quiz.meta.questions
      : [];

    if (!questions.length) {
      return res.status(400).json({ message: "Quiz has no questions configured." });
    }
    if (answers.length !== questions.length) {
      return res
        .status(400)
        .json({ message: `answers length (${answers.length}) must match questions (${questions.length})` });
    }

    // Score
    let score = 0;
    let maxScore = 0;
    const breakdown = questions.map((q, i) => {
      const pts = Number(q.points) || 1;
      maxScore += pts;

      const raw = answers[i];
      const selectedIndex = Number(typeof raw === "object" && raw !== null ? raw.selectedIndex : raw);
      const correctIndex = getCorrectIndex(q);

      const isCorrect =
        Number.isInteger(selectedIndex) &&
        Number.isInteger(correctIndex) &&
        selectedIndex === correctIndex;

      const pointsAwarded = isCorrect ? pts : 0;
      score += pointsAwarded;

      return {
        questionIndex: i,
        selectedIndex: Number.isInteger(selectedIndex) ? selectedIndex : -1,
        correctIndex: Number.isInteger(correctIndex) ? correctIndex : undefined,
        isCorrect,
        pointsAwarded,
      };
    });

    // Timing
    const started = startedAt ? new Date(startedAt) : undefined;
    const validStarted = started && !Number.isNaN(started.getTime()) ? started : undefined;
    const durationSec = validStarted
      ? Math.max(0, Math.round((Date.now() - validStarted.getTime()) / 1000))
      : undefined;

    const percent = maxScore ? round2((score / maxScore) * 100) : 0;

    // Attempt numbering (atomic / race-proof)
    await ensureCounterInitialized(quiz._id, req.user._id);
    const attemptNumber = await nextAttemptNo(quiz._id, req.user._id);

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      answers: breakdown.map(({ questionIndex, selectedIndex, isCorrect, pointsAwarded }) => ({
        questionIndex, selectedIndex, isCorrect, pointsAwarded,
      })),
      score,
      maxScore,
      percent,
      startedAt: validStarted,
      durationSec,
      status: "submitted",
      attemptNumber,
    });

    return res.status(201).json({
      attemptId: attempt._id,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percent: attempt.percent,
      durationSec: attempt.durationSec,
      createdAt: attempt.createdAt,
      attemptNumber: attempt.attemptNumber,
      breakdown, // optional for UI
    });
  } catch (e) {
    console.error("submitAttempt error:", e);
    const payload = { message: "Failed to submit attempt" };
    if (process.env.NODE_ENV !== "production") {
      payload.error = e.message;
      payload.stack = e.stack;
    }
    res.status(500).json(payload);
  }
};

// GET /api/quiz/:quizId/attempts  (admin/teacher)
// Optional: ?studentId=<id>&page=&limit=
exports.listAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!isValidObjectId(quizId)) return res.status(400).json({ message: "Invalid quizId" });

    const quiz = req.quiz || (await Content.findById(quizId).lean());
    if (!quiz || quiz.type !== "quiz") return res.status(404).json({ message: "Quiz not found" });

    const { page, limit, skip } = parsePageLimit(req.query);
    const filter = { quiz: quizId };
    if (req.query.studentId && isValidObjectId(req.query.studentId)) {
      filter.student = req.query.studentId;
    }

    const [rows, total] = await Promise.all([
      QuizAttempt.find(filter)
        .populate("student", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuizAttempt.countDocuments(filter),
    ]);

    res.json({ data: rows, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("listAttempts error:", e);
    const payload = { message: "Failed to fetch attempts" };
    if (process.env.NODE_ENV !== "production") {
      payload.error = e.message;
      payload.stack = e.stack;
    }
    res.status(500).json(payload);
  }
};

// GET /api/me/quiz-attempts  (student)
// Optional: ?page=&limit=
exports.myAttempts = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });

    const { page, limit, skip } = parsePageLimit(req.query);

    const [rows, total] = await Promise.all([
      QuizAttempt.find({ student: req.user._id })
        .populate("quiz", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuizAttempt.countDocuments({ student: req.user._id }),
    ]);

    res.json({ data: rows, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("myAttempts error:", e);
    const payload = { message: "Failed to fetch my attempts" };
    if (process.env.NODE_ENV !== "production") {
      payload.error = e.message;
      payload.stack = e.stack;
    }
    res.status(500).json(payload);
  }
};

// GET /api/quiz/:quizId/attempts/:attemptId  (owner OR teacher/admin)
exports.getAttemptById = async (req, res) => {
  try {
    const { quizId, attemptId } = req.params;
    if (!isValidObjectId(quizId)) return res.status(400).json({ message: "Invalid quizId" });
    if (!isValidObjectId(attemptId)) return res.status(400).json({ message: "Invalid attemptId" });

    const attempt = await QuizAttempt.findById(attemptId)
      .populate("student", "name email role")
      .populate("quiz", "title type")
      .lean();

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const belongs =
      String(attempt.quiz) === String(quizId) ||
      String(attempt.quiz?._id) === String(quizId);
    if (!belongs) {
      return res.status(400).json({ message: "Attempt does not belong to this quiz" });
    }

    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const isOwner = String(attempt.student?._id || attempt.student) === String(user._id);
    if (!isOwner && !isTeacherAdmin(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({
      attemptId: attempt._id,
      quiz: attempt.quiz,
      student: attempt.student,
      answers: attempt.answers,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percent: attempt.percent,
      durationSec: attempt.durationSec,
      createdAt: attempt.createdAt,
    });
  } catch (e) {
    console.error("getAttemptById error:", e);
    const payload = { message: "Failed to fetch attempt" };
    if (process.env.NODE_ENV !== "production") {
      payload.error = e.message;
      payload.stack = e.stack;
    }
    res.status(500).json(payload);
  }
};

module.exports = {
  submitAttempt: exports.submitAttempt,
  listAttempts: exports.listAttempts,
  myAttempts: exports.myAttempts,
  getAttemptById: exports.getAttemptById,
};
