// controllers/recommendationController.js
const recommendationService = require('../services/recommendationService');

/**
 * GET /recommendations
 * Fetch personalized recommendations for the authenticated user
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is set by auth middleware
    const recommendations = await recommendationService.getUserRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};
