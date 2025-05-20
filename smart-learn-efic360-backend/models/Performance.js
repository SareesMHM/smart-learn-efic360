const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjects: [String],
  scores: [Number],
  averageScore: Number,
  bestSubject: String,
  weakestSubject: String,
});

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
