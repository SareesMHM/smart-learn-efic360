// services/recommendationService.js
const axios = require('axios');

async function getUserRecommendations(userId) {
  const response = await axios.get(`/recommendations/${userId}`);
  return response.data;
}

module.exports = {
  getUserRecommendations,
};
