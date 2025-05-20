const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin', 'parent'], required: true },
  ip: String,
  userAgent: String,
  action: { type: String, enum: ['login', 'logout'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccessLog', accessLogSchema);

const AccessLog = require('../models/AccessLog');

const logAccess = (action) => async (req, res, next) => {
  if (req.user) {
    await AccessLog.create({
      userId: req.user._id,
      role: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      action
    });
  }
  next();
};

module.exports = logAccess;
