const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  const { studentId, date, status, remarks } = req.body;
  const existing = await Attendance.findOne({ studentId, date });

  if (existing) {
    existing.status = status;
    existing.remarks = remarks;
    await existing.save();
    return res.status(200).json({ message: 'Attendance updated' });
  }

  const attendance = new Attendance({ studentId, date, status, remarks, markedBy: req.user._id });
  await attendance.save();
  res.status(201).json({ message: 'Attendance marked' });
};

exports.getAttendance = async (req, res) => {
  const data = await Attendance.find().populate('studentId', 'fullName').sort({ date: -1 });
  res.status(200).json(data);
};

exports.deleteAttendance = async (req, res) => {
  await Attendance.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Attendance record deleted' });
};
