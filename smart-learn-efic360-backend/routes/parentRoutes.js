const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');

router.get('/:parentId/students', parentController.getChildren);
router.get('/student/:studentId/attendance', parentController.getAttendance);

module.exports = router;
