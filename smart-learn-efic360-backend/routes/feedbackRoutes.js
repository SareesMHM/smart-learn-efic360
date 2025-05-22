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


app.get('/api/feedback/all', (req, res) => {
  res.json([
    { _id: '1', category: 'Bug', message: 'Error on login', status: 'Pending' },
    //...
  ]);
});
