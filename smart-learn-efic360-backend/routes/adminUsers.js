// routes/adminUsers.js
const router = require('express').Router();
const {
  listUsers,
  updateUser,
  deleteUser,
  approve,
  reject,
  resend,
} = require('../controllers/adminUserController');

const { authorize, optionalAuth } = require('../utils/auth'); // <-- include optionalAuth

// READ: allow admin + teacher
router.get('/admin/users', authorize(['admin', 'teacher']), listUsers);

// WRITE: admin-only
router.put('/admin/users/:id', authorize(['admin']), updateUser);
router.delete('/admin/users/:id', authorize(['admin']), deleteUser);
router.post('/admin/users/:id/approve', authorize(['admin']), approve);
router.post('/admin/users/:id/reject',  authorize(['admin']), reject);
router.post('/admin/users/:id/resend',  authorize(['admin']), resend);

// Optional-auth example
router.get('/something/publicish', optionalAuth, (req, res) => {
  res.json({ ok: true, user: req.user || null });
});

// Quick debug helper: who am I?
router.get('/_debug/whoami', optionalAuth, (req, res) => {
  res.json(req.user || { role: 'guest' });
});

module.exports = router;
