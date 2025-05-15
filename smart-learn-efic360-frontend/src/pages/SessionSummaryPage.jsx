// src/pages/SessionSummaryPage.jsx
import React, { useEffect, useState } from 'react';
import summaryService from '../services/summaryService';
import '../styles/SessionSummaryPage.scss';

export default function SessionSummaryPage() {
  const [summary, setSummary] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await summaryService.getSessionSummary();
        setSummary(data.summary);
        setFeedback(data.feedback);
      } catch (err) {
        setError('Failed to load session summary.');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) return <p>Loading session summary...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="session-summary-page">
      <h1>Session Summary</h1>
      <section className="summary-section">
        <h2>Summary</h2>
        <p>{summary}</p>
      </section>

      <section className="feedback-section">
        <h2>Feedback</h2>
        <p>{feedback}</p>
      </section>
    </div>
  );
}
