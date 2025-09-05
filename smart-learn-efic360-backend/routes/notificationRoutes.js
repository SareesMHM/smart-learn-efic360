// routes/notificationRoutes.js
const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markManyAsRead,
  createMaterialNotification,
  deleteNotification,
} = require('../controllers/notificationController');

const { requireAuth, requireRole } = require('../utils/auth');

const router = express.Router();

// List notifications for the current user
router.get('/notifications', requireAuth, getNotifications);

// Unread count badge
router.get('/notifications/unread-count', requireAuth, getUnreadCount);

// Mark one as read
router.put('/notifications/:notificationId/read', requireAuth, markAsRead);

// Mark many as read
router.put('/notifications/read-many', requireAuth, markManyAsRead);

// Create (from staff or system) — teacher/admin only
router.post(
  '/notifications/material',
  requireAuth,
  requireRole(['admin', 'teacher']),
  createMaterialNotification
);

// Delete a notification (optional) — teacher/admin only
router.delete(
  '/notifications/:notificationId',
  requireAuth,
  requireRole(['admin', 'teacher']),
  deleteNotification
);

module.exports = router;
