const mongoose = require("mongoose");
const QuizAttempt = require("../models/QuizAttempt");
const { Content } = require("../models/materialModel"); // your Content + discriminators

// POST /api/quiz/:quizId/attempts
exports.submitAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers = [], startedAt } = req.body; // answers: [selectedIndex,...]
    if (!Array.isArray(answers)) return res.status(400).json({ message: "answers must be an array" });

    const quiz = await Content.findById(quizId).lean();
    if (!quiz || quiz.type !== "quiz") return res.status(404).json({ message: "Quiz not found" });

    const questions = quiz.questions || [];
    const maxScore = questions.reduce((s, q) => s + (q.points || 1), 0);

    let score = 0;
    const normalizedAnswers = [];
    questions.forEach((q, i) => {
      const selectedIndex = Number(answers[i] ?? -1);
      if (Number.isInteger(selectedIndex) && selectedIndex === q.correctIndex) {
        score += Number(q.points || 1);
      }
      normalizedAnswers.push({ questionIndex: i, selectedIndex });
    });

    const started = startedAt ? new Date(startedAt) : undefined;
    const durationSec = started ? Math.max(0, Math.round((Date.now() - started.getTime()) / 1000)) : undefined;
    const percent = maxScore ? (score / maxScore) * 100 : 0;

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,          // requires auth middleware
      answers: normalizedAnswers,
      score,
      maxScore,
      percent: Math.round(percent * 100) / 100,
      startedAt: started,
      durationSec,
    });

    return res.status(201).json({
      attemptId: attempt._id,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percent: attempt.percent,
      durationSec: attempt.durationSec,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};

// GET /api/quiz/:quizId/attempts  (admin/teacher)
exports.listAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const rows = await QuizAttempt.find({ quiz: quizId })
      .populate("student", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};

// GET /api/me/quiz-attempts  (student)
exports.myAttempts = async (req, res) => {
  try {
    const rows = await QuizAttempt.find({ student: req.user._id })
      .populate("quiz", "title")
      .sort({ createdAt: -1 })
      .lean();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch my attempts" });
  }
};
