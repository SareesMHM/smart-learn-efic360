const cron = require('node-cron');
const { sendEmailWithAttachment } = require('../utils/emailHelper');
const { exportToPDF } = require('../utils/reportExport');

cron.schedule('0 8 * * MON', async () => {
  const data = await Report.find().populate('teacherId').populate('studentId');
  const filePath = await exportToPDF(data);
  await sendEmailWithAttachment('admin@example.com', 'Weekly Report', 'Attached is the weekly report.', filePath);
});
