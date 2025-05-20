const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendmail = require('../utils/emailHelper');

// Add user by admin
const addUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    confirmPassword,
    nic,
    dateOfBirth,
    address,
    phone,
    parentName,
    parentPhone,
    gradeId,
    subject,
    qualifications,
    childrenName,
    work,
    gender,
    role
  } = req.body;

  if (!role || !fullName || !email || !password || !nic || !dateOfBirth || !address || !phone) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ message: 'Email already registered.' });

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    fullName,
    email,
    password: hashedPassword,
    nic,
    dateOfBirth,
    address,
    phone,
    role,
    parentName: role === 'student' ? parentName : undefined,
    parentPhone: role === 'student' ? parentPhone : undefined,
    gradeId: role === 'student' ? gradeId : undefined,
    subject: role === 'teacher' ? subject : undefined,
    qualifications: role === 'teacher' ? qualifications : undefined,
    childrenName: role === 'parent' ? childrenName : undefined,
    work: role === 'parent' ? work : undefined,
    gender,
    isValidEmail: true,
    isApproved: true
  });

  if (req.file) {
    user.profileImage = req.file.filename;
  }

  await user.save();

  res.status(201).json({ message: `${role} registered successfully by admin.` });
});
// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// GET /api/admin/users?role=student
const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.query;
  if (!role) return res.status(400).json({ message: 'Role query param is required.' });
  const users = await User.find({ role });
  res.status(200).json(users);
});


// PUT /api/admin/users/:id
const editUser = asyncHandler(async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updated);
});


// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'User deleted' });
});


// Get users by role


// Approve student
const approveStudent = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'student') {
    return res.status(404).json({ message: 'Student not found.' });
  }

  user.isApproved = true;
  await user.save();

  res.status(200).json({ message: 'Student approved.' });
});

// Reject student
const rejectStudent = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'student') {
    return res.status(404).json({ message: 'Student not found.' });
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Student rejected and deleted.' });
});

// Resend email verification
const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  if (user.isValidEmail) {
    return res.status(400).json({ message: 'Email already verified.' });
  }

  const emailToken = crypto.randomBytes(20).toString('hex');
  user.emailValidationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
  user.emailValidationTokenExpire = Date.now() + 3600000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONT_END_URL}/email/verify/${emailToken}`;
  const message = `
    Hi ${user.fullName || ''},
    Please verify your email by clicking the link below:
    <a href="${verificationUrl}">Verify Email</a>
  `;

  await sendmail({
    email: user.email,
    subject: 'Resend Email Verification - Smart Learn EFIC 360',
    message,
  });

  res.status(200).json({ message: 'Verification email resent.' });
});

module.exports = {
   addUser,
   getAllUsers,
  getUsersByRole,
  editUser,
  deleteUser,
  approveStudent,
  rejectStudent,
  resendEmailVerification
};