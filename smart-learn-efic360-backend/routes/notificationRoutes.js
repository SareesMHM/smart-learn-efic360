const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const router = express.Router();

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api', notificationRoutes);

router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markAsRead);

module.exports = router;
