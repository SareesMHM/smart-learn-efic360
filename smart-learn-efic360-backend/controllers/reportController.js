const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const { exportToPDF, exportToExcel } = require('../utils/reportExport');

const generateReport = asyncHandler(async (req, res) => {
  const { grade, dateFrom, dateTo, teacherId, subject } = req.query;
  const filter = {};
  if (grade) filter.gradeId = grade;
  if (teacherId) filter.teacherId = teacherId;
  if (subject) filter.subject = subject;
  if (dateFrom && dateTo) filter.createdAt = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };

  const data = await Report.find(filter).populate('teacherId', 'fullName').populate('studentId', 'fullName');
  res.status(200).json(data);
});

const exportReport = asyncHandler(async (req, res) => {
  const { format = 'pdf' } = req.query;
  const data = await Report.find().populate('teacherId').populate('studentId');

  if (format === 'excel') {
    const file = await exportToExcel(data);
    res.download(file);
  } else {
    const file = await exportToPDF(data);
    res.download(file);
  }
});

module.exports = { generateReport, exportReport };