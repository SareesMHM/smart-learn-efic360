// routes/voiceRoutes.js
const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/command', authMiddleware, voiceController.processVoiceCommand);

module.exports = router;
