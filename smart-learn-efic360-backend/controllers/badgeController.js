// controllers/badgeController.js
const Badge = require('../models/Badge');
const Reward = require('../models/Reward');

// Fetch all badges
exports.getBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.status(200).json({ badges });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching badges', error });
  }
};

// Fetch all rewards
exports.getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.status(200).json({ rewards });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rewards', error });
  }
};
