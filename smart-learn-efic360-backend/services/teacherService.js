// services/teacherService.js
const axios = require('axios');

async function getPendingAssignments(teacherId) {
  const response = await axios.get(`/teacher/${teacherId}/assignments/pending`);
  return response.data;
}

async function getContentSuggestions(teacherId) {
  const response = await axios.get(`/teacher/${teacherId}/content-suggestions`);
  return response.data;
}

module.exports = {
  getPendingAssignments,
  getContentSuggestions,
};
