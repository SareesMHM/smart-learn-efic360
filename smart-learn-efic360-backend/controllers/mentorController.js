const asyncHandler = require('express-async-handler');
const Mentor = require('../models/mentorModel');
const Session = require('../models/sessionModel');
const User = require('../models/User');

// Get all active mentors
exports.getActiveMentors = asyncHandler(async (req, res) => {
  const mentors = await Mentor.find({ status: 'active' }).populate('userId', 'name email');
  res.status(200).json(mentors);
});

// Book a session with a mentor
exports.bookMentorSession = asyncHandler(async (req, res) => {
  const { mentorId, sessionDate } = req.body;

  const mentor = await Mentor.findById(mentorId);
  if (!mentor) {
    return res.status(404).json({ message: 'Mentor not found' });
  }

  const newSession = new Session({
    studentId: req.user.id,  // Assuming the user is authenticated and req.user.id is set
    mentorId: mentorId,
    sessionDate: new Date(sessionDate),
  });

  await newSession.save();
  res.status(201).json({ message: 'Session booked successfully' });
});

// Get sessions for the current user (student or mentor)
exports.getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    $or: [{ studentId: req.user.id }, { mentorId: req.user.id }],
  }).populate('studentId mentorId', 'name email');
  
  res.status(200).json(sessions);
});
