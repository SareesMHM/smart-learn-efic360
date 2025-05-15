// services/analyticsService.js
const axios = require('axios');

async function getBehavioralData(userId) {
  const response = await axios.get(`/analytics/behavioral/${userId}`);
  return response.data;
}

module.exports = {
  getBehavioralData,
};
