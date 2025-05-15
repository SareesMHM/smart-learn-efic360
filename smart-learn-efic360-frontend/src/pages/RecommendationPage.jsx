// src/pages/RecommendationPage.jsx
import React, { useEffect, useState } from 'react';
import recommendationService from '../services/recommendationService';
import '../styles/RecommendationPage.scss';

export default function RecommendationPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const data = await recommendationService.getRecommendations();
        setRecommendations(data);
      } catch (err) {
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="recommendation-page">
      <h1>Your Personalized Recommendations</h1>
      {recommendations.length === 0 ? (
        <p>No recommendations available at this time.</p>
      ) : (
        <ul className="recommendation-list">
          {recommendations.map((item) => (
            <li key={item.id} className="recommendation-item">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                Start Learning
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
