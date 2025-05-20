const Quiz = require('../models/Quiz');

// Get quiz data
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ active: true }); // Fetch the active quiz
    if (!quiz) {
      return res.status(404).json({ message: 'No active quiz available' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz', error);
    res.status(500).json({ message: 'Error fetching quiz data' });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  const { answers } = req.body;

  try {
    // Assuming you have a function to check the answers and provide feedback
    const result = await checkQuizAnswers(answers); // Dummy function, you can implement this based on your logic

    res.status(200).json({
      feedback: result.feedback,
    });
  } catch (error) {
    console.error('Error submitting quiz', error);
    res.status(500).json({ message: 'Error submitting quiz' });
  }
};
