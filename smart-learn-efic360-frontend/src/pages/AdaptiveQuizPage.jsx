import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

import { useNavigate } from 'react-router-dom';

const AdaptiveQuizPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch quiz data
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get('/api/quiz');
      setQuiz(res.data);
    } catch (err) {
      console.error('Error fetching quiz', err);
    }
  };

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = [...prevAnswers];
      const existingAnswerIndex = updatedAnswers.findIndex(
        (answer) => answer.questionId === questionId
      );
      if (existingAnswerIndex !== -1) {
        updatedAnswers[existingAnswerIndex] = { questionId, selectedAnswer };
      } else {
        updatedAnswers.push({ questionId, selectedAnswer });
      }
      return updatedAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (questionIndex < quiz.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      handleQuizCompletion();
    }
  };

  const handleQuizCompletion = async () => {
    setQuizCompleted(true);
    try {
      // Submit the answers to the backend to check the quiz result
      const result = await axios.post('/api/quiz/submit', { answers });
      setFeedback(result.data.feedback);
    } catch (err) {
      console.error('Error submitting quiz', err);
    }
  };

  return (
    <div className="adaptive-quiz-page">
      <Helmet>
        <title>Adaptive Quiz | Smart Learn EFIC 360</title>
      </Helmet>

      <h2 className="quiz-title">{quiz ? quiz.title : 'Loading quiz...'}</h2>

      {quiz && !quizCompleted && (
        <div className="quiz-content">
          <div className="question">
            <h3>{quiz.questions[questionIndex].questionText}</h3>
            <div className="options">
              {quiz.questions[questionIndex].options.map((option, index) => (
                <label key={index}>
                  <input
                    type="radio"
                    name={`question-${quiz.questions[questionIndex].id}`}
                    value={option}
                    onChange={() =>
                      handleAnswerChange(quiz.questions[questionIndex].id, option)
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleNextQuestion}>Next</button>
        </div>
      )}

      {quizCompleted && feedback && (
        <div className="quiz-feedback">
          <h3>Quiz Completed!</h3>
          <p>{feedback}</p>
          <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
};

export default AdaptiveQuizPage;
