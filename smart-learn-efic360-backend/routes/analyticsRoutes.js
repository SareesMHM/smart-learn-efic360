// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/behavioral', authMiddleware, analyticsController.getBehavioralAnalytics);

module.exports = router;
