// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/assignments/pending', authMiddleware, teacherController.getAssignments);
router.get('/content-suggestions', authMiddleware, teacherController.getContentSuggestions);

module.exports = router;
