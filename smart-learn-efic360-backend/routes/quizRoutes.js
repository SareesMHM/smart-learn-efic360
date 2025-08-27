const express = require("express");
const { submitAttempt, listAttempts, myAttempts } = require("../controllers/quizController");
const { requireAuth, requireRole } = require("../utils/auth"); // see below

const router = express.Router();

router.post("/quiz/:quizId/attempts", requireAuth, submitAttempt);
router.get("/quiz/:quizId/attempts", requireAuth, requireRole(["admin", "teacher"]), listAttempts);
router.get("/me/quiz-attempts", requireAuth, myAttempts);

module.exports = router;
