// routes/chatRoutes.js
const router = require("express").Router();
const chatController = require("../controllers/chatController");

router.post("/send-message", chatController.sendMessage);

module.exports = router;
