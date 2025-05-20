const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');

// Get notifications for a user
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  
  res.status(200).json({ notifications });
});

// Mark notification as read
exports.markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({ message: 'Notification marked as read' });
});
