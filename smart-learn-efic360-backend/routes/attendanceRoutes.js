const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', protect, isAdmin, attendanceController.markAttendance);
router.get('/', protect, isAdmin, attendanceController.getAttendance);
router.delete('/:id', protect, isAdmin, attendanceController.deleteAttendance);

module.exports = router;
