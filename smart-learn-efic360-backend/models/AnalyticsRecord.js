const mongoose = require('mongoose');

const analyticsRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: String,
  eventData: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalyticsRecord', analyticsRecordSchema);
