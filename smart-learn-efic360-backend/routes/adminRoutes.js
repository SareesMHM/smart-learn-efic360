// routes/admin.routes.js
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/adminController');
const upload = require('../utils/upload');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// OPTIONAL (only if you added the controller shown earlier)
const notif = require('../controllers/notificationController');

// ----- Guard all admin routes -----
router.use(protect, isAdmin);

// ----- Users (CRUD & lists) -----
router.post('/users', upload.single('profileImage'), ctrl.addUser);
router.get('/users', ctrl.getAllUsers);
router.get('/users-by-role', ctrl.getUsersByRole);
router.put('/users/:id', upload.single('profileImage'), ctrl.editUser);
router.delete('/users/:id', ctrl.deleteUser);

// ----- Student moderation (canonical) -----
router.put('/students/:id/approve', ctrl.approveStudent);
router.delete('/students/:id/reject', ctrl.rejectStudent);

// ----- Legacy aliases (keep if old frontend calls still exist) -----
router.post('/users/:id/approve', ctrl.approveStudent);
router.post('/users/:id/reject', ctrl.rejectStudent);

// ----- Notifications (admin create) -----
// NOTE: ensure notif.createMaterialNotification exists in your controller
router.post('/notifications/material', notif.createMaterialNotification);

// ----- Email (admin tools) -----
router.post('/resend-email/:id', ctrl.resendEmailVerification);

module.exports = router;
