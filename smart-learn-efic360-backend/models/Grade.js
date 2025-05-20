// models/Grade.js
const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
    unique: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Grade', gradeSchema);


// routes/gradeRoutes.js
const express = require('express');
const router = express.Router();
const { createGrade, getGrades, updateGrade, deleteGrade } = require('../controllers/gradeController');
const { isAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(isAdmin, createGrade)  // POST /api/grades
  .get(getGrades);             // GET /api/grades

router.route('/:id')
  .put(isAdmin, updateGrade)   // PUT /api/grades/:id
  .delete(isAdmin, deleteGrade); // DELETE /api/grades/:id

module.exports = router;
