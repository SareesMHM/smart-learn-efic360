// src/services/adaptiveFlowService.js
import axios from './api'; // Axios instance configured with baseURL

/**
 * Get current adaptive learning flow data
 * @returns {Promise<{ currentStep: object, steps: array }>}
 */
const getCurrentFlow = async () => {
  const response = await axios.get('/adaptive-flow/current');
  return response.data;
};

/**
 * Advance to the next step in the adaptive flow
 * @param {string} stepId - Current step ID
 * @returns {Promise<{ currentStep: object, steps: array }>}
 */
const advanceStep = async (stepId) => {
  const response = await axios.post('/adaptive-flow/advance', { stepId });
  return response.data;
};

export default {
  getCurrentFlow,
  advanceStep,
};
