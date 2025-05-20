const express = require('express');
const { getActiveMentors, bookMentorSession, getUserSessions } = require('../controllers/mentorController');
const router = express.Router();

// Get all active mentors
router.get('/mentors', getActiveMentors);

// Book a session with a mentor
router.post('/sessions/book', bookMentorSession);

// Get user sessions (both mentor and student)
router.get('/sessions', getUserSessions);

module.exports = router;
