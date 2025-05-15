const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedAt: Date,
  status: { type: String, enum: ['pending', 'graded'], default: 'pending' },
  grade: Number,
  feedback: String
});

module.exports = mongoose.model('Assignment', assignmentSchema);
