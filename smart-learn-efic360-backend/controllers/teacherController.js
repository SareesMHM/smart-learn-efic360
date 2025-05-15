// controllers/teacherController.js
const teacherService = require('../services/teacherService');

/**
 * GET /teacher/assignments/pending
 * Fetch assignments that need grading by the teacher
 */
exports.getPendingAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id; // From auth middleware
    const assignments = await teacherService.fetchPendingAssignments(teacherId);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

/**
 * POST /teacher/assignments/:id/grade
 * Submit a grade and feedback for an assignment
 */
exports.submitGrade = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignmentId = req.params.id;
    const { grade, feedback } = req.body;

    await teacherService.gradeAssignment(teacherId, assignmentId, grade, feedback);
    res.json({ message: 'Grade submitted successfully' });
  } catch (error) {
    console.error('Error submitting grade:', error);
    res.status(500).json({ error: 'Failed to submit grade' });
  }
};

/**
 * GET /teacher/content-suggestions
 * Get AI-generated content suggestions for the teacher
 */
exports.getContentSuggestions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const suggestions = await teacherService.getContentSuggestions(teacherId);
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching content suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch content suggestions' });
  }
};
