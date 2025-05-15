// routes/summaryRoutes.js
const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/session', authMiddleware, summaryController.getSessionSummary);

module.exports = router;
