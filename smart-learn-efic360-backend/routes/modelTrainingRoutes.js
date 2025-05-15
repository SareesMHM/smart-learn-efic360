// routes/modelTrainingRoutes.js
const express = require('express');
const router = express.Router();
const modelTrainingController = require('../controllers/modelTrainingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/training-jobs', authMiddleware, modelTrainingController.getTrainingJobs);
router.post('/training-jobs/start', authMiddleware, modelTrainingController.startTrainingJob);
router.get('/training-jobs/:jobId/logs', authMiddleware, modelTrainingController.getTrainingJobLogs);

module.exports = router;
