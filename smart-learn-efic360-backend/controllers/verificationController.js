const crypto = require('crypto');
const User = require('../models/User');
const sendmail = require('../utils/emailHelper');

// Resend email verification
exports.resendVerificationEmail = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.isValidEmail) return res.status(400).json({ message: 'Email already verified' });

  const token = crypto.randomBytes(20).toString('hex');
  user.emailValidationToken = crypto.createHash('sha256').update(token).digest('hex');
  user.emailValidationTokenExpire = Date.now() + 3600000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const verifyURL = `${process.env.FRONT_END_URL}/email/verify/${token}`;
  const message = `<p>Hi ${user.fullName},</p><p>Click below to verify your email:</p><a href="${verifyURL}">Verify Email</a>`;

  await sendmail({ email: user.email, subject: 'Verify Your Email', message });

  res.status(200).json({ message: 'Verification email resent' });
};

// Mark email as verified
exports.verifyEmail = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailValidationToken: hashedToken,
    emailValidationTokenExpire: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.isValidEmail = true;
  user.emailValidationToken = undefined;
  user.emailValidationTokenExpire = undefined;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully' });
};
