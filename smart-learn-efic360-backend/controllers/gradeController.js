// controllers/gradeController.js
const asyncHandler = require('express-async-handler');
const Grade = require('../models/Grade');

// Create new grade
const createGrade = asyncHandler(async (req, res) => {
  const { grade, teacherId, capacity } = req.body;

  if (!grade || !teacherId || !capacity) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const exists = await Grade.findOne({ grade });
  if (exists) {
    return res.status(409).json({ message: 'Grade already exists.' });
  }

  const newGrade = await Grade.create({ grade, teacherId, capacity });
  res.status(201).json(newGrade);
});

// Get all grades
const getGrades = asyncHandler(async (req, res) => {
  const grades = await Grade.find();
  res.status(200).json(grades);
});

// Update grade
const updateGrade = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Update logic here' });
});

// Delete grade
const deleteGrade = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Delete logic here' });
});

//  Export all functions together
module.exports = {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade,
};
