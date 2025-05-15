const mongoose = require('mongoose');

const adaptiveFlowStepSchema = new mongoose.Schema({
  stepId: { type: String, unique: true },
  title: String,
  description: String,
  order: Number,
  resources: [String] // URLs or resource IDs
});

module.exports = mongoose.model('AdaptiveFlowStep', adaptiveFlowStepSchema);
