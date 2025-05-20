const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getUsersByRole,
  editUser,
  deleteUser,
  approveStudent,
  rejectStudent,
  resendEmailVerification,
} = require('../controllers/adminController');

router.post('/users', upload.single('profileImage'), addUser);

// GET users by role (e.g., student, teacher, parent, admin)
router.get('/users', getUsersByRole);

router.get('/users/all', getAllUsers);


router.put('/users/:id', editUser);
router.delete('/users/:id', deleteUser);

// PUT approve a student
router.put('/students/:id/approve', approveStudent);

// DELETE reject a student
router.delete('/students/:id/reject', rejectStudent);

// POST resend email verification
router.post('/resend-email/:id', resendEmailVerification);

module.exports = router;
