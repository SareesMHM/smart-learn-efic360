// controllers/registrationController.js
const Registration = require('../models/Registration');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

exports.uploadFiles = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      nic,
      dateOfBirth,
      address,
      phone,
      parentName,
      parentPhone,
      gradeId,
      role,
    } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const user = new User({
      name: fullName,
      email,
      password: hashedPassword,
      role: role || 'student',
    });
    await user.save();

    // Create registration document
    const registration = new Registration({
      fullName,
      email,
      nic,
      dateOfBirth,
      address,
      phone,
      parentName,
      parentPhone,
      gradeId,
      role,
      pdfUrl: req.files?.pdfFile ? req.files.pdfFile[0].path : null,
      profileImageUrl: req.files?.profileImage ? req.files.profileImage[0].path : null,
      status: 'pending',
    });

    await registration.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
