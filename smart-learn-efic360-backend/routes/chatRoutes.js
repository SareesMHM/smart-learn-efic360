// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat/send-message
router.post('/send-message', chatController.sendMessage);

module.exports = router;
