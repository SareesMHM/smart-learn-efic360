// models/Reward.js
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  imageUrl: { type: String },
});

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
