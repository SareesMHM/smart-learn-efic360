// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware'); // optional auth

router.post('/send-message', authMiddleware, chatController.sendMessage);

module.exports = router;
