const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuizAttemptSchema = new Schema(
  {
    quiz: { type: Schema.Types.ObjectId, ref: "Content", required: true }, // Content with type='quiz'
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedIndex: { type: Number, required: true },
      },
    ],
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    percent: { type: Number, required: true },
    startedAt: Date,
    submittedAt: { type: Date, default: Date.now },
    durationSec: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);
