const express = require('express');
const { getPerformanceData } = require('../controllers/performanceController');
const router = express.Router();

// Protected route
router.get('/performance', getPerformanceData);

module.exports = router;
