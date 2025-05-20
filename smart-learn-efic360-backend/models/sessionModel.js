const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  sessionDate: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'canceled'], default: 'scheduled' },
  feedback: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
