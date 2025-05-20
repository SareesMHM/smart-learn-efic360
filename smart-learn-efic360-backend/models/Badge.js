// models/Badge.js
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  condition: { type: String, required: true }, // e.g., "Complete 5 quizzes"
  points: { type: Number, default: 0 },
});

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
