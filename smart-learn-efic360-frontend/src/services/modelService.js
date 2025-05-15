// src/services/modelService.js
import axios from './api'; // Axios instance configured with baseURL

/**
 * Fetch list of model training jobs with status and metrics
 * @returns {Promise<Array>} Array of training job objects
 */
const getTrainingJobs = async () => {
  const response = await axios.get('/models/training-jobs');
  return response.data;
};

export default {
  getTrainingJobs,
};
