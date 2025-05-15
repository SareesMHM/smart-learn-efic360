const mongoose = require('mongoose');

const sessionSummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  summaryText: String,
  feedbackText: String,
  sessionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SessionSummary', sessionSummarySchema);
