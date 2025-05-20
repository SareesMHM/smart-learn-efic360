const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expertise: { type: String, required: true },
  availableSlots: [{ date: Date, time: String }],  // Available time slots for mentorship
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Mentor = mongoose.model('Mentor', mentorSchema);
module.exports = Mentor;
