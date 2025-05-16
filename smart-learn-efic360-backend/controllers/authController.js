const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendmail = require('../utils/sendMail');
const sendToken = require('../utils/sendToken');

// Register new user
const register = asyncHandler(async (req, res) => {
  const { role, email, password, confirmPassword } = req.body;

  if (!role || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ message: 'Email already registered.' });

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    ...req.body,
    password: hashedPassword,
  });

  // Create email verification token
  const emailToken = crypto.randomBytes(20).toString('hex');
  user.emailValidationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
  user.emailValidationTokenExpire = Date.now() + 3600000; // 1 hour

  await user.save();

  const verificationUrl = `${process.env.FRONT_END_URL}/email/verify/${emailToken}`;
  const message = `
    Hi ${user.firstname || ''} ${user.lastname || ''},
    Please verify your email by clicking the link below:
    <a href="${verificationUrl}">Verify Email</a>
    If you did not register, please ignore this email.
  `;

  try {
    await sendmail({
      email: user.email,
      subject: 'Verify your email - Smart Learn EFIC 360',
      message,
    });
    sendToken(user, 201, res, `Verification email sent to ${user.email}`);
  } catch (error) {
    user.emailValidationToken = undefined;
    user.emailValidationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: 'Could not send verification email.' });
  }
});

// Verify Email
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailValidationToken: hashedToken,
    emailValidationTokenExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

  user.isValidEmail = true;
  user.emailValidationToken = undefined;
  user.emailValidationTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, res, 'Email successfully verified.');
});

// Resend Verification Email
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isValidEmail) return res.status(400).json({ message: 'Email already verified.' });

  const emailToken = crypto.randomBytes(20).toString('hex');
  user.emailValidationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
  user.emailValidationTokenExpire = Date.now() + 3600000;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONT_END_URL}/email/verify/${emailToken}`;
  const message = `
    Hi ${user.firstname || ''} ${user.lastname || ''},
    Please verify your email by clicking the link below:
    <a href="${verificationUrl}">Verify Email</a>
  `;

  try {
    await sendmail({
      email: user.email,
      subject: 'Verify your email - Smart Learn EFIC 360',
      message,
    });
    res.status(200).json({ message: 'Verification email resent.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not send verification email.' });
  }
});

// Change User Email
const changeUserEmail = asyncHandler(async (req, res) => {
  const user = req.user;
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const emailExists = await User.findOne({ email });
  if (emailExists) return res.status(400).json({ message: 'Email already exists.' });

  user.email = email;
  user.isValidEmail = false; // Require re-verification
  await user.save();

  // Send verification email again
  const emailToken = crypto.randomBytes(20).toString('hex');
  user.emailValidationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
  user.emailValidationTokenExpire = Date.now() + 3600000;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONT_END_URL}/email/verify/${emailToken}`;
  const message = `
    Hi ${user.firstname || ''} ${user.lastname || ''},
    Please verify your new email by clicking the link below:
    <a href="${verificationUrl}">Verify Email</a>
  `;

  try {
    await sendmail({
      email: user.email,
      subject: 'Verify your new email - Smart Learn EFIC 360',
      message,
    });
    res.status(200).json({ message: `Verification email sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ message: 'Could not send verification email.' });
  }
});

// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Please enter email and password.' });

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

  if (!user.isValidEmail) return res.status(403).json({ message: 'Please verify your email first.' });

  sendToken(user, 200, res);
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({ message: 'Logged out successfully.' });
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Please provide your email.' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'No user found with this email.' });

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONT_END_URL}/password/reset/${resetToken}`;
  const message = `
    You requested a password reset.
    Click here to reset your password: ${resetUrl}
    If you did not request this, please ignore this email.
  `;

  try {
    await sendmail({
      email: user.email,
      subject: 'Password Reset - Smart Learn EFIC 360',
      message,
    });
    res.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: 'Email could not be sent.' });
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.params.resetToken;
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });

  user.password = await bcrypt.hash(req.body.password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res, 'Password reset successful.');
});

// Get Profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json({ user });
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });

  if (newPassword !== confirmNewPassword) return res.status(400).json({ message: 'New passwords do not match.' });

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.status(200).json({ message: 'Password changed successfully.' });
});

// Update Profile
const updateMyprofile = asyncHandler(async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
  res.status(200).json({ user });
});

// Delete Profile
const deleteMyprofile = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.status(200).json({ message: 'User profile deleted successfully.' });
});

module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail,
  changeUserEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  changePassword,
  updateMyprofile,
  deleteMyprofile,
};
