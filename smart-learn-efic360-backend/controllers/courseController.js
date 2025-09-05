const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const User = require('../models/User');

// Create a new course
const createCourse = asyncHandler(async (req, res) => {
  const { subject, grade, teacherId } = req.body;

  // if (!subject) return res.status(400).json({ message: 'Course subject is required.' });
//grade
  const course = new Course({
    subject,
    grade,
    teacherId: teacherId || null
  });

  const saved = await course.save();
  res.status(201).json(saved);
});

// Get all courses with optional search
const getCourses = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let filter = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter = { $or: [{ subject: regex }, { grade: regex }] };
  }

  const courses = await Course.find(filter)
  .populate({ path: 'teacherId', select: 'fullName email' })
  .lean();
  res.status(200).json(courses);
});

// Update course details
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });

  const { subject, grade, teacherId } = req.body;

  course.subject = subject || course.subject;
  course.grade = grade || course.grade;
  course.teacher = teacherId || course.teacherId;

  const updated = await course.save();
  res.status(200).json(updated);
});

// Delete a course
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });

  await course.remove();
  res.status(200).json({ message: 'Course deleted.' });
});

module.exports = {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse
};
