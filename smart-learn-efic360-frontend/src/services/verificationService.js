// services/verificationService.js
const crypto = require('crypto');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken'); // A model to store tokens (create below)
const emailService = require('./emailService');

const TOKEN_EXPIRY_HOURS = 24;

/**
 * Generate and save a verification token for a user
 * @param {mongoose.ObjectId} userId
 * @returns {Promise<string>} the generated token
 */
async function generateVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Save token in DB
  await VerificationToken.create({
    userId,
    token,
    expiresAt,
  });

  return token;
}

/**
 * Verify token and activate user account
 * @param {string} token
 * @returns {Promise<boolean>} true if verified successfully
 */
async function verifyToken(token) {
  const record = await VerificationToken.findOne({ token });
  if (!record) return false;

  if (record.expiresAt < new Date()) {
    await VerificationToken.deleteOne({ _id: record._id });
    return false;
  }

  // Activate user
  await User.findByIdAndUpdate(record.userId, { isVerified: true });

  // Remove token after successful verification
  await VerificationToken.deleteOne({ _id: record._id });

  return true;
}

/**
 * Send verification email to user
 * @param {string} email
 * @param {string} token
 * @param {string} frontendUrl
 */
async function sendVerificationEmail(email, token, frontendUrl) {
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
  const subject = 'Verify your Smart Learn EFIC 360 account';
  const text = `Please verify your account by clicking the link: ${verifyUrl}`;
  const html = `<p>Please verify your account by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`;

  await emailService.sendEmail({ to: email, subject, text, html });
}

module.exports = {
  generateVerificationToken,
  verifyToken,
  sendVerificationEmail,
};
