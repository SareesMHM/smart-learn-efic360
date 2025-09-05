// routes/quizRoutes.js (CommonJS)
const express = require("express");
const mongoose = require("mongoose");
const { Content } = require("../models/materialModel");

// Normalize controller imports (CJS or ESM)
const quizCtrlMod = require("../controllers/quizController");
const quizCtrl = quizCtrlMod && quizCtrlMod.default ? quizCtrlMod.default : quizCtrlMod;
const { submitAttempt, listAttempts, myAttempts, getAttemptById } = quizCtrl;

// Normalize auth imports (CJS or ESM)
const authMod = require("../utils/auth");
const auth = authMod && authMod.default ? authMod.default : authMod;
const { requireAuth, requireRole } = auth;

const router = express.Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// --------- Fail-fast import sanity check ----------
const bad = [submitAttempt, listAttempts, myAttempts, getAttemptById, requireAuth, requireRole]
  .some((fn) => typeof fn !== "function");
if (bad) {
  const dump = {
    submitAttempt: typeof submitAttempt,
    listAttempts: typeof listAttempts,
    myAttempts: typeof myAttempts,
    getAttemptById: typeof getAttemptById,
    requireAuth: typeof requireAuth,
    requireRole: typeof requireRole,
  };
  console.error("quizRoutes: One or more handlers are not functions:", dump);
  throw new Error("Invalid handler imports in quizRoutes");
}

// --------- Param loaders ----------
router.param("quizId", async (req, res, next, quizId) => {
  if (!isValidObjectId(quizId)) {
    return res.status(400).json({ message: "Invalid quizId." });
  }
  try {
    const quiz = await Content.findById(quizId).lean();
    if (!quiz || quiz.type !== "quiz") {
      return res.status(404).json({ message: "Quiz not found." });
    }
    req.quiz = quiz; // controllers can use req.quiz
    return next();
  } catch (e) {
    const payload = { message: "Failed to load quiz." };
    if (process.env.NODE_ENV !== "production") payload.error = e.message;
    return res.status(500).json(payload);
  }
});

router.param("attemptId", (req, res, next, attemptId) => {
  if (!isValidObjectId(attemptId)) {
    return res.status(400).json({ message: "Invalid attemptId." });
  }
  req.attemptId = attemptId; // optional, controller still reads from req.params
  next();
});

// --------- Routes ----------

// Create/submit an attempt (auth required)
// POST /api/quiz/:quizId/attempts
router.post("/quiz/:quizId/attempts", requireAuth, submitAttempt);

// List attempts for a quiz (teachers/admins)
// GET /api/quiz/:quizId/attempts?studentId=&page=&limit=
router.get(
  "/quiz/:quizId/attempts",
  requireAuth,
  requireRole(["admin", "teacher"]),
  listAttempts
);

// Current user's attempts across quizzes
// GET /api/me/quiz-attempts?page=&limit=
router.get("/me/quiz-attempts", requireAuth, myAttempts);

// Fetch a single attempt (owner OR teacher/admin)
// GET /api/quiz/:quizId/attempts/:attemptId
router.get(
  "/quiz/:quizId/attempts/:attemptId",
  requireAuth,
  getAttemptById
);

module.exports = router;
