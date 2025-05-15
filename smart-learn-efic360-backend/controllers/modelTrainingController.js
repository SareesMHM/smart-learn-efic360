// controllers/modelTrainingController.js
const modelTrainingService = require('../services/modelTrainingService');

/**
 * GET /models/training-jobs
 * Retrieve the list of model training jobs with status and metrics
 */
exports.getTrainingJobs = async (req, res) => {
  try {
    const jobs = await modelTrainingService.listTrainingJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching training jobs:', error);
    res.status(500).json({ error: 'Failed to fetch training jobs' });
  }
};

/**
 * POST /models/training-jobs/start
 * Start a new model training job
 */
exports.startTrainingJob = async (req, res) => {
  try {
    const jobDetails = req.body; // e.g., model type, hyperparameters
    const job = await modelTrainingService.startTraining(jobDetails);
    res.status(201).json(job);
  } catch (error) {
    console.error('Error starting training job:', error);
    res.status(500).json({ error: 'Failed to start training job' });
  }
};

/**
 * GET /models/training-jobs/:jobId/logs
 * Get logs for a specific training job
 */
exports.getTrainingJobLogs = async (req, res) => {
  try {
    const { jobId } = req.params;
    const logs = await modelTrainingService.getJobLogs(jobId);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching training job logs:', error);
    res.status(500).json({ error: 'Failed to fetch training job logs' });
  }
};
