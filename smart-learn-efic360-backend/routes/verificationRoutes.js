const express = require('express');
const router = express.Router();
const { resendVerificationEmail, verifyEmail } = require('../controllers/verificationController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.post('/resend/:id', protect, isAdmin, resendVerificationEmail);

router.post('/resend/:id', resendVerificationEmail);
router.get('/verify/:token', verifyEmail);

module.exports = router;
