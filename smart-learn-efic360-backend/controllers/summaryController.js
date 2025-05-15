// controllers/summaryController.js
const summaryService = require('../services/summaryService');

/**
 * GET /session/summary
 * Returns AI-generated session summary and feedback for the authenticated user
 */
exports.getSessionSummary = async (req, res) => {
  try {
    const userId = req.user.id; // Provided by authentication middleware
    const summaryData = await summaryService.generateSummary(userId);
    res.json(summaryData); // { summary: string, feedback: string }
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate session summary' });
  }
};
