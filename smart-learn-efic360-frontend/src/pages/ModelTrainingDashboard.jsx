// src/pages/ModelTrainingDashboard.jsx
import React, { useEffect, useState } from 'react';
import modelService from '../services/modelService';
import '../styles/ModelTrainingDashboard.scss';

export default function ModelTrainingDashboard() {
  const [trainingJobs, setTrainingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTrainingJobs() {
      try {
        const data = await modelService.getTrainingJobs();
        setTrainingJobs(data);
      } catch (err) {
        setError('Failed to load training jobs.');
      } finally {
        setLoading(false);
      }
    }
    fetchTrainingJobs();
  }, []);

  if (loading) return <p>Loading model training dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="model-training-dashboard">
      <h1>Model Training Dashboard</h1>
      {trainingJobs.length === 0 ? (
        <p>No active or completed training jobs found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Model Name</th>
              <th>Status</th>
              <th>Started At</th>
              <th>Completed At</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {trainingJobs.map(job => (
              <tr key={job.id}>
                <td>{job.modelName}</td>
                <td>{job.status}</td>
                <td>{new Date(job.startedAt).toLocaleString()}</td>
                <td>{job.completedAt ? new Date(job.completedAt).toLocaleString() : '—'}</td>
                <td>{job.accuracy ? `${(job.accuracy * 100).toFixed(2)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
