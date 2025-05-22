const Student = require('../models/Student');

// GET /api/parent/:parentId/students
exports.getChildren = async (req, res) => {
  const { parentId } = req.params;
  const students = await Student.find({ parentId });
  res.json(students);
};

// GET /api/parent/student/:studentId/attendance
exports.getAttendance = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findById(studentId);
  res.json(student.attendance);
};
