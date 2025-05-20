import React, { useState } from 'react';
import axios from '../api/axios';

const FeedbackForm = ({ feedbackType }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFeedbackChange = (e) => {
    setFeedbackText(e.target.value);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!feedbackText) {
      setError('Feedback cannot be empty');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/feedback', { feedbackType, feedbackText });
      setSuccessMessage(response.data.message);
      setFeedbackText('');
    } catch (err) {
      setError('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form">
      <h3>Provide Your Feedback</h3>
      <textarea
        placeholder="Write your feedback here..."
        value={feedbackText}
        onChange={handleFeedbackChange}
        rows="5"
      ></textarea>

      <button onClick={handleSubmitFeedback} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>

      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  );
};

export default FeedbackForm;
