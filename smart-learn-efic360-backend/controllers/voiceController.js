// controllers/voiceController.js
const voiceService = require('../services/voiceService');

/**
 * POST /voice/command
 * Receives a voice command (as text) and returns AI-processed response
 */
exports.processVoiceCommand = async (req, res) => {
  try {
    const { command, sessionId } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Voice command text is required' });
    }

    // Process the command with your AI or voice service
    const response = await voiceService.handleCommand(command, sessionId);

    res.json({ response });
  } catch (error) {
    console.error('Voice command processing error:', error);
    res.status(500).json({ error: 'Failed to process voice command' });
  }
};
