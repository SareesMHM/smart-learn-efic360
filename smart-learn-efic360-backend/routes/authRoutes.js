const express = require('express');
const router = express.Router();

const upload = require('../utils/upload'); // Make sure this is correct
const { register, login, resendVerificationEmail, verifyEmail, logout, getProfile, changeUserEmail } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Ensure all handlers are functions
router.post('/register', upload.fields([{ name: 'profileImage', maxCount: 1 }]), register);
router.post('/login', login);
router.put('/email/resend', protect, resendVerificationEmail);
router.put('/email/verify/:token', protect, verifyEmail);
router.put('/email/change', protect, changeUserEmail);
router.put('/logout',logout );
router.get('/getProfile',protect,getProfile );

module.exports = router;
