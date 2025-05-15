// src/services/teacherService.js
import axios from './api'; // Axios instance configured with baseURL

/**
 * Fetch list of assignments pending grading
 * @returns {Promise<Array>} Array of assignment objects
 */
const getAssignments = async () => {
  const response = await axios.get('/teacher/assignments/pending');
  return response.data; // Example: [{ id, title, studentName, submittedAt }]
};

export default {
  getAssignments,
};
