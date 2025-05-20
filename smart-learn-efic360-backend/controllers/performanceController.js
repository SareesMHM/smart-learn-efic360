const Performance = require('../models/Performance'); // Your performance model
const User = require('../models/User'); // Your user model

// Get performance data for a student
exports.getPerformanceData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the performance data for the logged-in student
    const performanceData = await Performance.findOne({ userId }).lean();
    if (!performanceData) {
      return res.status(404).json({ message: 'Performance data not found' });
    }

    // Return the performance data
    res.status(200).json(performanceData);
  } catch (err) {
    console.error('Error fetching performance data', err);
    res.status(500).json({ message: 'Error fetching performance data' });
  }
};
