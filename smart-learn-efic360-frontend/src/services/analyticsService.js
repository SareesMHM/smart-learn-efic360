// src/services/analyticsService.js
import axios from './api'; // Axios instance configured with baseURL

/**
 * Fetch behavioral analytics data for the logged-in user
 * @returns {Promise<Object>} Analytics data object
 */
const getBehavioralData = async () => {
  const response = await axios.get('/analytics/behavioral');
  return response.data;
};

export default {
  getBehavioralData,
};
