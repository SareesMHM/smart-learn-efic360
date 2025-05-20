const express = require('express');
const { getFeedback, submitFeedback } = require('../controllers/feedbackController');
const router = express.Router();

// Fetch feedback
router.get('/feedback', getFeedback);

// Submit feedback
router.post('/feedback', submitFeedback);

module.exports = router;
const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api', feedbackRoutes);


