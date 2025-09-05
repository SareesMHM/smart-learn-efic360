// controllers/chatController.js
const ChatSession = require("../models/chatSessionModel");
const aiService = require("../services/aiService");

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message text is required." });
    }
    if (!sessionId && !userId) {
      return res.status(400).json({ error: "sessionId or userId is required." });
    }

    const query = userId ? { userId } : { sessionId };
    let session = await ChatSession.findOne(query);
    if (!session) session = new ChatSession({ ...query, messages: [] });

    // push user msg
    session.messages.push({ sender: "user", text: message.trim(), timestamp: new Date() });

    // build AI context
    const context = session.messages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    // ask Gemini
    const aiReply = await aiService.getResponse(context);

    // push bot msg
    session.messages.push({ sender: "bot", text: aiReply, timestamp: new Date() });
    await session.save();

    return res.json({ reply: aiReply });
  } catch (err) {
    // surface the reason (still 500)
    const message = err?.message || "Internal server error";
    console.error("sendMessage failed:", message);
    return res.status(500).json({ error: message });
  }
};
