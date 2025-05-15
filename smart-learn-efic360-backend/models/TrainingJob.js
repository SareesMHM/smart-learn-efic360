const mongoose = require('mongoose');

const trainingJobSchema = new mongoose.Schema({
  modelName: String,
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
  startedAt: Date,
  completedAt: Date,
  accuracy: Number,
  logs: [String]
});

module.exports = mongoose.model('TrainingJob', trainingJobSchema);
