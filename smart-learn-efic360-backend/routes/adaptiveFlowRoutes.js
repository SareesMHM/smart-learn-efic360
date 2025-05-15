// routes/adaptiveFlowRoutes.js
const express = require('express');
const router = express.Router();
const adaptiveFlowController = require('../controllers/adaptiveFlowController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/current', authMiddleware, adaptiveFlowController.getCurrentFlow);
router.post('/advance', authMiddleware, adaptiveFlowController.advanceStep);

module.exports = router;
