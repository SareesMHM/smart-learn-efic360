const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');

const exportToPDF = async (data) => {
  const doc = new PDFDocument();
  const filePath = 'exports/report.pdf';
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(20).text('Academy Report Summary', { align: 'center' });

  data.forEach((record, i) => {
    doc.moveDown().fontSize(12).text(`${i + 1}. ${record.studentId?.fullName} - ${record.gradeId}`);
  });

  doc.end();
  return filePath;
};

const exportToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reports');

  worksheet.columns = [
    { header: 'Student', key: 'student', width: 30 },
    { header: 'Teacher', key: 'teacher', width: 30 },
    { header: 'Grade', key: 'grade', width: 10 },
    { header: 'Subject', key: 'subject', width: 20 },
    { header: 'Date', key: 'date', width: 15 }
  ];

  data.forEach((record) => {
    worksheet.addRow({
      student: record.studentId?.fullName,
      teacher: record.teacherId?.fullName,
      grade: record.gradeId,
      subject: record.subject,
      date: record.createdAt?.toISOString().split('T')[0]
    });
  });

  const filePath = 'exports/report.xlsx';
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

module.exports = { exportToPDF, exportToExcel };