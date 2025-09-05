// models/Counter.js
const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g., `${quizId}:${studentId}`
    seq: { type: Number, default: 0, min: 0 },           // last issued number
  },
  { timestamps: true }
);

CounterSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('Counter', CounterSchema);
