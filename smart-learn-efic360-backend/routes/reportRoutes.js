const express = require('express');
const router = express.Router();
const { generateReport, exportReport } = require('../controllers/reportController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', protect, isAdmin, generateReport); // View report
router.get('/export', protect, isAdmin, exportReport); // Export report

module.exports = router;