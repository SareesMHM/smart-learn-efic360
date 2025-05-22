const express = require('express');
const router = express.Router();
const {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade
} = require('../controllers/gradeController');

const { protect, isAdmin } = require('../middlewares/authMiddleware'); //  add this

router.route('/')
  .post(protect, isAdmin, createGrade)   // POST /api/grades
  .get(getGrades);                       // GET /api/grades

router.route('/:id')
  .put(protect, isAdmin, updateGrade)    // PUT /api/grades/:id
  .delete(protect, isAdmin, deleteGrade); // DELETE /api/grades/:id

module.exports = router;
