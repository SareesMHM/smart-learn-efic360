// models/QuizAttempt.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ---------- Subdocument: per-question answer ---------- */
const AnswerSchema = new Schema(
  {
    questionIndex: { type: Number, required: true, min: 0 },
    selectedIndex: { type: Number, required: true }, // -1 if none
    isCorrect: { type: Boolean, default: false },
    pointsAwarded: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/* ---------- Main Attempt schema ---------- */
const QuizAttemptSchema = new Schema(
  {
    quiz:    { type: Schema.Types.ObjectId, ref: "Content", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "User",    required: true, index: true },

    answers: {
      type: [AnswerSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "answers cannot be empty",
      },
    },

    // Scoring
    score:    { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    percent:  { type: Number, required: true, min: 0, max: 100 },

    // Session times
    startedAt:   { type: Date },
    submittedAt: { type: Date },
    durationSec: { type: Number, min: 0 },

    // Status
    status: {
      type: String,
      enum: ["in-progress", "submitted", "expired"],
      default: "submitted",
      index: true,
    },

    // Extras
    // IMPORTANT: no default here — controller must set it
    attemptNumber: { type: Number, min: 1, required: true },
    feedback: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/* ---------- Indexes ---------- */
QuizAttemptSchema.index({ quiz: 1, createdAt: -1 });
QuizAttemptSchema.index({ student: 1, createdAt: -1 });
QuizAttemptSchema.index(
  { quiz: 1, student: 1, attemptNumber: 1 },
  { unique: true, name: "uq_quiz_student_attemptNo" }
);

/* ---------- Hooks ---------- */
QuizAttemptSchema.pre("validate", function (next) {
  if (this.maxScore > 0 && (this.percent === undefined || this.percent === null)) {
    const pct = (this.score / this.maxScore) * 100;
    this.percent = Math.round(pct * 100) / 100;
  }
  next();
});

QuizAttemptSchema.pre("save", function (next) {
  if (this.status === "submitted") {
    if (!this.submittedAt) this.submittedAt = new Date();
    if (
      this.startedAt &&
      this.submittedAt &&
      (this.durationSec === undefined || this.durationSec === null)
    ) {
      this.durationSec = Math.max(
        0,
        Math.round((this.submittedAt.getTime() - this.startedAt.getTime()) / 1000)
      );
    }
  }
  next();
});

/* ---------- Statics ---------- */
QuizAttemptSchema.statics.nextAttemptNumberFor = async function (quizId, studentId) {
  const last = await this.findOne({ quiz: quizId, student: studentId })
    .sort({ attemptNumber: -1 })
    .select("attemptNumber")
    .lean();
  return (last?.attemptNumber || 0) + 1;
};

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);
