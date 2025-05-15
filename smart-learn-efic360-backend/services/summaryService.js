// services/summaryService.js
const axios = require('axios');

async function generateSummary(userId) {
  const response = await axios.get(`/session/summary/${userId}`);
  return response.data;
}

module.exports = {
  generateSummary,
};
