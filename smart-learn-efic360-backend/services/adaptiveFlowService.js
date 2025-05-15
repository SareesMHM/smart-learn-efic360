// services/adaptiveFlowService.js
const axios = require('axios');

async function getCurrentFlow(userId) {
  const response = await axios.get(`/adaptive-flow/current/${userId}`);
  return response.data;
}

async function advanceStep(userId, stepId) {
  const response = await axios.post(`/adaptive-flow/advance/${userId}`, { stepId });
  return response.data;
}

module.exports = {
  getCurrentFlow,
  advanceStep,
};
