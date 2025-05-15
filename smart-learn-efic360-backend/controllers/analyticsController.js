// controllers/analyticsController.js
const analyticsService = require('../services/analyticsService');

/**
 * GET /analytics/behavioral
 * Fetch behavioral learning analytics data for the authenticated user
 */
exports.getBehavioralAnalytics = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets this
    const analyticsData = await analyticsService.getBehavioralData(userId);
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch behavioral analytics data' });
  }
};
