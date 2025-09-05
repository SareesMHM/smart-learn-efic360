const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  grade:{
    type:Number, required:true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assumes your teacher users are stored in the User model with role = 'teacher'
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
