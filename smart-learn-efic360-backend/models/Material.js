// models/Material.js
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'assignment', 'notes', 'link'],
    required: true,
  },
  description: {
    type: String,
    default: ''
  },
  file: {
    type: String, // file name stored in server
  },
  link: {
    type: String, // used only if type === 'link'
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Material', materialSchema);
