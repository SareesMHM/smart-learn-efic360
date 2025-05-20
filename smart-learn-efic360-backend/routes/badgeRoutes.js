// routes/badgeRoutes.js
const express = require('express');
const { getBadges, getRewards } = require('../controllers/badgeController');
const router = express.Router();

router.get('/badges', getBadges);
router.get('/rewards', getRewards);

module.exports = router;
