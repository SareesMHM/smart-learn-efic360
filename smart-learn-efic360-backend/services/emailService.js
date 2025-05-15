// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g., smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: false,                     // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,    // your email user
    pass: process.env.SMTP_PASS,    // your email password or app password
  },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Smart Learn EFIC 360" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  sendEmail,
};
