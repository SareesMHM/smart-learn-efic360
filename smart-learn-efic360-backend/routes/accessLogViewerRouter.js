const express = require('express');
const router = express.Router();
const {
  getLogs,
  getLoginStats,
  getSuspiciousActivity,
  exportLogs
} = require('../controllers/accessLogViewerController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// 🔐 Admin-only routes
router.get('/', protect, isAdmin, getLogs); // View all access logs
router.get('/stats', protect, isAdmin, getLoginStats); //  Chart data (daily/weekly)
router.get('/suspicious', protect, isAdmin, getSuspiciousActivity); //  Suspicious login detection
router.get('/export', protect, isAdmin, exportLogs); //  Export logs to Excel

module.exports = router;
