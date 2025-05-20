// routes/gradeRoutes.js
const express = require('express');
const router = express.Router();
const { createGrade, getGrades } = require('../controllers/gradeController');

// Base route: /api/grades
router.route('/')
  .post(createGrade)   // POST /api/grades
  .get(getGrades);     // GET /api/grades
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, isAdmin, createGrade);
router.put('/:id', protect, isAdmin, updateGrade);
router.delete('/:id', protect, isAdmin, deleteGrade);

module.exports = router;
