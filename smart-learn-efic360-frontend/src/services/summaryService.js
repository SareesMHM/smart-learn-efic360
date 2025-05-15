// src/services/summaryService.js
import axios from './api'; // Axios instance configured with baseURL

/**
 * Fetch AI-generated session summary and feedback
 * @returns {Promise<{summary: string, feedback: string}>}
 */
const getSessionSummary = async () => {
  const response = await axios.get('/session/summary');
  return response.data;
};

export default {
  getSessionSummary,
};
