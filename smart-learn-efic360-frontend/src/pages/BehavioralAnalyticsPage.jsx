// src/pages/BehavioralAnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import analyticsService from '../services/analyticsService';
import '../styles/BehavioralAnalyticsPage.scss';

export default function BehavioralAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await analyticsService.getBehavioralData();
        setAnalyticsData(data);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="behavioral-analytics-page">
      <h1>Behavioral Learning Analytics</h1>
      {/* Example data display - replace with charts/graphs as needed */}
      <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
    </div>
  );
}
