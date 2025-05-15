// controllers/adaptiveFlowController.js
const adaptiveFlowService = require('../services/adaptiveFlowService');

/**
 * GET /adaptive-flow/current
 * Get current adaptive learning flow state for the user
 */
exports.getCurrentFlow = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const flowData = await adaptiveFlowService.getCurrentFlow(userId);
    res.json(flowData); // { currentStep: {...}, steps: [...] }
  } catch (error) {
    console.error('Error fetching adaptive flow:', error);
    res.status(500).json({ error: 'Failed to fetch adaptive flow' });
  }
};

/**
 * POST /adaptive-flow/advance
 * Advance user to the next step in the adaptive flow
 */
exports.advanceStep = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stepId } = req.body;
    const updatedFlow = await adaptiveFlowService.advanceStep(userId, stepId);
    res.json(updatedFlow); // Updated flow state
  } catch (error) {
    console.error('Error advancing adaptive flow step:', error);
    res.status(500).json({ error: 'Failed to advance adaptive flow step' });
  }
};
