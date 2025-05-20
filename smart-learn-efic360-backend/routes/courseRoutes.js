const express = require('express');
const {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

const { protect, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Admin only)
router.post('/', protect, isAdmin, createCourse);

// @route   GET /api/courses
// @desc    Get all courses (with optional search)
// @access  Private (Admin or Teacher)
router.get('/', protect, getCourses);

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private (Admin only)
router.put('/:id', protect, isAdmin, updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private (Admin only)
router.delete('/:id', protect, isAdmin, deleteCourse);

module.exports = router;
