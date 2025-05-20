// models/Attendance.js

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
