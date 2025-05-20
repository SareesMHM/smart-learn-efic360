const asyncHandler = require('express-async-handler');
const AccessLog = require('../models/AccessLog');
const ExcelJS = require('exceljs');

// 📌 Get all logs with optional filters (e.g., date, user)
const getLogs = asyncHandler(async (req, res) => {
  const { startDate, endDate, userId } = req.query;

  const filter = {};
  if (startDate && endDate) {
    filter.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (userId) filter.userId = userId;

  const logs = await AccessLog.find(filter).sort({ timestamp: -1 });
  res.status(200).json(logs);
});

// 📊 Login statistics grouped by date
const getLoginStats = asyncHandler(async (req, res) => {
  const stats = await AccessLog.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  res.status(200).json(stats);
});

// 🕵️ Suspicious login detection (e.g., too many failures, new IPs, etc.)
const getSuspiciousActivity = asyncHandler(async (req, res) => {
  const failedLogins = await AccessLog.find({ success: false });

  const suspicious = failedLogins.reduce((acc, log) => {
    const key = `${log.userId}_${log.ip}`;
    acc[key] = acc[key] ? acc[key] + 1 : 1;
    return acc;
  }, {});

  const flagged = Object.entries(suspicious)
    .filter(([_, count]) => count >= 5)
    .map(([key]) => {
      const [userId, ip] = key.split('_');
      return { userId, ip, attempts: suspicious[key] };
    });

  res.status(200).json(flagged);
});

// 📁 Export logs to Excel
const exportLogs = asyncHandler(async (req, res) => {
  const logs = await AccessLog.find().lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Access Logs');

  sheet.columns = [
    { header: 'User ID', key: 'userId', width: 20 },
    { header: 'IP Address', key: 'ip', width: 20 },
    { header: 'Status', key: 'success', width: 10 },
    { header: 'Timestamp', key: 'timestamp', width: 30 },
    { header: 'User Agent', key: 'userAgent', width: 40 }
  ];

  logs.forEach(log => {
    sheet.addRow({
      userId: log.userId,
      ip: log.ip,
      success: log.success ? 'Success' : 'Failed',
      timestamp: log.timestamp.toISOString(),
      userAgent: log.userAgent
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=access_logs.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = {
  getLogs,
  getLoginStats,
  getSuspiciousActivity,
  exportLogs
};
