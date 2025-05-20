// This app uses a unified User model for all roles (student, teacher, parent, admin).
// If you want a dedicated Admin model with extra fields, define it like this:

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'view_reports', 'edit_settings'],
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin', adminSchema);
