const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: String,
  status: String, // Present, Absent, Late
});

const studentSchema = new mongoose.Schema({
  name: String,
  grade: String,
  parentId: String, // Link to parent
  attendance: [attendanceSchema],
  grades: [
    {
      subject: String,
      score: Number,
    },
  ],
});

module.exports = mongoose.model('Student', studentSchema);
