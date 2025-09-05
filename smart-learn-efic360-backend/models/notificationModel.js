// controllers/notificationController.js
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// GET /api/notifications?limit=&type=&subject=&grade=
exports.getNotifications = async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);

    // Base filter:
    const filter = {};
    // If you do per-user notifications:
    // filter.userId = req.user._id;

    // If you broadcast to cohorts, include cohort filter (subject/grade)
    if (req.query.type) filter.type = req.query.type;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.grade) filter.grade = Number(req.query.grade);

    // Example: fetch all for the student's grade/subject (customize as needed)
    // If you want only unread for this user and using readBy array:
    // filter.readBy = { $ne: req.user._id };

    const rows = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // If you use per-user "read" boolean, you may want to attach it:
    // rows = rows.map(n => ({ ...n, read: Boolean(n.read) }));

    res.json(rows);
  } catch (e) {
    console.error('getNotifications error:', e);
    res.status(500).json({ message: 'Failed to load notifications' });
  }
};

// PUT /api/notifications/:notificationId/read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: 'Invalid notificationId' });
    }

    // If you use readBy array (broadcast model):
    await Notification.updateOne(
      { _id: notificationId },
      { $addToSet: { readBy: req.user._id } }
    );

    // If you use per-user notifications with "read" boolean:
    // await Notification.updateOne(
    //   { _id: notificationId, userId: req.user._id },
    //   { $set: { read: true } }
    // );

    res.json({ ok: true });
  } catch (e) {
    console.error('markAsRead error:', e);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// (Optional) POST /api/notifications/material  — called by teacher/CM when creating/updating material
exports.createMaterialNotification = async (req, res) => {
  try {
    const { title, type, subject, grade, materialId, description, link } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const doc = await Notification.create({
      title,
      type: type || 'general',
      subject,
      grade: grade !== undefined ? Number(grade) : undefined,
      materialId,
      description,
      link,
    });

    res.status(201).json(doc);
  } catch (e) {
    console.error('createMaterialNotification error:', e);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};
