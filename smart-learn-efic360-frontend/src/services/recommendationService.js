// src/services/recommendationService.js
import axios from './api'; // Axios instance configured with baseURL

/**
 * Fetch personalized learning recommendations for the current user
 * @returns {Promise<Array>} Array of recommendation objects
 */
const getRecommendations = async () => {
  const response = await axios.get('/recommendations'); // Adjust endpoint as per your backend
  return response.data; // Expected: Array of { id, title, description, url }
};

export default {
  getRecommendations,
};
