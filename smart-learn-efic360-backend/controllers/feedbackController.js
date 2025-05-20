const asyncHandler = require('express-async-handler');
const Feedback = require('../models/feedbackModel');

// Get feedback for a user (filtered by type like quiz, lesson, or assignment)
exports.getFeedback = asyncHandler(async (req, res) => {
  const userId = req.user.id; // assuming JWT or session middleware

  const feedbacks = await Feedback.find({ userId }).sort({ createdAt: -1 });
  res.status(200).json(feedbacks);
});

// Post feedback for quiz, lesson, or assignment
exports.submitFeedback = asyncHandler(async (req, res) => {
  const { feedbackType, feedbackText } = req.body;

  if (!feedbackType || !feedbackText) {
    return res.status(400).json({ message: 'Feedback type and text are required' });
  }

  const newFeedback = new Feedback({
    userId: req.user.id,
    feedbackType,
    feedbackText,
  });

  await newFeedback.save();
  res.status(201).json({ message: 'Feedback submitted successfully' });
});
