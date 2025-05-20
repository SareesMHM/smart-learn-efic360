import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const FeedbackList = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('/api/feedback');
      setFeedbackList(response.data);
    } catch (err) {
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-list">
      <h3>Your Feedback</h3>
      {loading && <p>Loading feedback...</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {feedbackList.map((feedback) => (
          <li key={feedback._id} className="feedback-item">
            <strong>{feedback.feedbackType}</strong>
            <p>{feedback.feedbackText}</p>
            <small>{new Date(feedback.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeedbackList;
