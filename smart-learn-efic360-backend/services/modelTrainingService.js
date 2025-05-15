// services/modelTrainingService.js
const axios = require('axios');

async function listTrainingJobs() {
  const response = await axios.get('/models/training-jobs');
  return response.data;
}

async function startTraining(jobDetails) {
  const response = await axios.post('/models/training-jobs/start', jobDetails);
  return response.data;
}

module.exports = {
  listTrainingJobs,
  startTraining,
};
