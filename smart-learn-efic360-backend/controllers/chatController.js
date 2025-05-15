// controllers/chatController.js
const ChatSession = require('../models/chatSessionModel');
const aiService = require('../services/aiService');

exports.sendMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Load or create chat session for user
    let session = await ChatSession.findOne({ userId });
    if (!session) {
      session = new ChatSession({ userId, messages: [] });
    }

    // Add user message to session
    session.messages.push({ sender: 'user', text: message.trim(), timestamp: new Date() });

    // Prepare context messages for AI prompt
    const contextMessages = session.messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    // Call AI service to get response text
    const aiResponse = await aiService.getResponse(contextMessages);

    // Add AI response to session
    session.messages.push({ sender: 'bot', text: aiResponse, timestamp: new Date() });

    // Save updated session
    await session.save();

    // Return AI reply to frontend
    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Error in chatController.sendMessage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
