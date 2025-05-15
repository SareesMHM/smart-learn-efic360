const mongoose = require('mongoose');

const voiceCommandSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  commandText: String,
  processedResponse: String,
  sessionId: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VoiceCommand', voiceCommandSchema);
