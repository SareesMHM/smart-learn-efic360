// src/pages/Feedback.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Other');
  const [feedbacks, setFeedbacks] = useState([]);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/feedback/submit',
        { message, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('');
      setCategory('Other');
      fetchFeedbacks(); // re-fetch feedback after submission
    } catch (err) {
      console.error(err);
    }
  };

  //  Wrap inside a function
  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/feedback/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Feedback response:', res.data);
      setFeedbacks(res.data.feedbacks); // adjust if backend returns { feedbacks: [...] }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="feedback-container">
      <h2>Submit Feedback</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your feedback..."
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Bug">Bug</option>
          <option value="Feature Request">Feature Request</option>
          <option value="Complaint">Complaint</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit">Submit</button>
      </form>

      <h3>All Feedback</h3>
      {Array.isArray(feedbacks) && feedbacks.length === 0 ? (
        <p>No feedback submitted.</p>
      ) : (
        <ul>
          {feedbacks.map((fb) => (
            <li key={fb._id}>
              <strong>{fb.category}</strong>: {fb.message}
              <br />
              <small>Status: {fb.status}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feedback;
