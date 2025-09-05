// controllers/notificationController.js
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Query:
 *   - unread=true       -> only those where current user NOT in readBy
 *   - limit, page       -> pagination (default 20, page 1)
 *   - type=material,... -> optional filter by type
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { unread, type, page = 1, limit = 20 } = req.query;

    const matchTargets = {
      $or: [
        { userId }, // direct
        { userId: { $exists: false }, grade: req.user.grade }, // broadcast by grade
        // Add subject matching here if your students track subjects:
        // { userId: { $exists: false }, grade: req.user.grade, subject: { $in: req.user.subjects || [] } }
      ],
    };

    const filters = [matchTargets];
    if (type) filters.push({ type });
    if (unread === 'true') filters.push({ readBy: { $ne: userId } });

    const query = { $and: filters };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Notification.countDocuments(query),
    ]);

    res.json({
      data: items,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

/**
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const matchTargets = {
      $or: [
        { userId },
        { userId: { $exists: false }, grade: req.user.grade },
      ],
    };
    const count = await Notification.countDocuments({
      ...matchTargets,
      readBy: { $ne: userId },
    });
    res.json({ count });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    res.status(500).json({ message: 'Failed to fetch unread count.' });
  }
};

/**
 * PUT /api/notifications/:notificationId/read
 * Marks a single notification as read by current user (idempotent)
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification id.' });
    }

    const matchTargets = {
      _id: notificationId,
      $or: [
        { userId }, // direct
        { userId: { $exists: false }, grade: req.user.grade }, // broadcast by grade
      ],
    };

    const updated = await Notification.findOneAndUpdate(
      matchTargets,
      { $addToSet: { readBy: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Notification not found.' });
    res.json(updated);
  } catch (err) {
    console.error('markAsRead error:', err);
    res.status(500).json({ message: 'Failed to mark as read.' });
  }
};

/**
 * PUT /api/notifications/read-many
 * Body: { ids: [<id1>, <id2>, ...] }
 */
exports.markManyAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ message: 'ids array is required.' });
    }

    await Notification.updateMany(
      {
        _id: { $in: ids.filter(mongoose.isValidObjectId) },
        $or: [{ userId }, { userId: { $exists: false }, grade: req.user.grade }],
      },
      { $addToSet: { readBy: userId } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('markManyAsRead error:', err);
    res.status(500).json({ message: 'Failed to mark notifications as read.' });
  }
};

/**
 * POST /api/notifications/material
 * Create a notification for a new material.
 * Body:
 *  - title (required)
 *  - type: 'video'|'pdf'|'assignment'|'notes'|'link'|'quiz' (required)
 *  - materialId (optional but recommended)
 *  - link (frontend route, e.g., /dashboard/materials/:id) (required)
 *  - grade, subject (broadcast)  OR userId (direct)
 *  - message (optional)
 *
 * NOTE: This creates a SINGLE broadcast doc if no userId is provided.
 * Students in that grade (and subject, if you filter that in getNotifications)
 * will see it and it remains unread until they open the page and you call markAsRead.
 */
exports.createMaterialNotification = async (req, res) => {
  try {
    const { title, type, materialId, link, grade, subject, userId, message = '' } = req.body;

    if (!title || !type || !link) {
      return res.status(400).json({ message: 'title, type, and link are required.' });
    }

    // Validate your enum client-side too
    const allowed = ['video', 'pdf', 'assignment', 'notes', 'link', 'quiz', 'chatbot', 'general'];
    if (!allowed.includes(type)) {
      return res.status(400).json({ message: `Invalid type: ${type}` });
    }

    // Validate target: either direct user or broadcast by grade/subject
    const hasDirect = !!userId;
    const hasBroadcast = grade != null || !!subject;
    if (!hasDirect && !hasBroadcast) {
      return res.status(400).json({ message: 'Provide userId or (grade/subject) to target recipients.' });
    }

    const doc = await Notification.create({
      userId: userId || undefined,
      subject: subject || undefined,
      grade: grade != null ? Number(grade) : undefined,
      materialId: materialId || null,
      title,
      message,
      type,
      link,
      createdBy: req.user?._id,
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('createMaterialNotification error:', err);
    res.status(500).json({ message: 'Failed to create material notification.' });
  }
};

/**
 * DELETE /api/notifications/:notificationId
 * (Optional) Admin/teacher cleanup
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification id.' });
    }
    const deleted = await Notification.findByIdAndDelete(notificationId).lean();
    if (!deleted) return res.status(404).json({ message: 'Not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteNotification error:', err);
    res.status(500).json({ message: 'Failed to delete notification.' });
  }
};
