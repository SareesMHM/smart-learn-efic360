// routes/admin.routes.js
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/adminController');
const upload = require('../utils/upload');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// secure everything
router.use(protect, isAdmin);

// create
router.post('/users', upload.single('profileImage'), ctrl.addUser);

// ✅ unified list (search + pagination)
router.get('/users', ctrl.getAllUsers);

// (optional legacy) list by role
router.get('/users-by-role', ctrl.getUsersByRole);

// update/delete
router.put('/users/:id', upload.single('profileImage'), ctrl.editUser);
router.delete('/users/:id', ctrl.deleteUser);

// student moderation
router.put('/students/:id/approve', ctrl.approveStudent);
router.delete('/students/:id/reject', ctrl.rejectStudent);

// email
router.post('/resend-email/:id', ctrl.resendEmailVerification);

module.exports = router;
