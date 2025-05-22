import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axios from '../api/axios';

const OfflineLearning = () => {
  const [offlineResources, setOfflineResources] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchOfflineResources();
  }, []);

  const fetchOfflineResources = async () => {
    setLoading(true);
    try {
      // Fetch offline resources from the backend (mocked here)
      const response = await axios.get('/offline/resources');
      setOfflineResources(response.data);
    } catch (err) {
      setError('Failed to fetch offline resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resourceId) => {
    try {
      // Logic to handle resource download (e.g., fetch and save to localStorage)
      setProgress(0); // Reset progress bar
      const response = await axios.get(`/offline/resources/${resourceId}`, {
        responseType: 'blob',
      });

      // Simulate download progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
        }
      }, 100);

      // After download simulation, save resource locally
      const fileBlob = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);
      localStorage.setItem(`offlineResource-${resourceId}`, fileURL);

      // Notify the user
      alert('Resource downloaded successfully for offline use.');
    } catch (err) {
      setError('Failed to download the resource.');
    }
  };

  return (
    <div className="offline-learning-container">
      
      <h1 className="page-title">Offline Learning Resources</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="offline-resources">
        {loading ? (
          <p>Loading offline resources...</p>
        ) : (
          <div className="resources-list">
            {offlineResources.length > 0 ? (
              offlineResources.map((resource) => (
                <div className="resource-item" key={resource.id}>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <button
                    onClick={() => handleDownload(resource.id)}
                    className="btn-download"
                    disabled={progress === 100}
                  >
                    {progress === 100 ? 'Downloaded' : `Download (${progress}%)`}
                  </button>
                </div>
              ))
            ) : (
              <p>No offline resources available at the moment.</p>
            )}
          </div>
        )}
      </div>

      <div className="offline-progress">
        <p>Download Progress</p>
        <progress value={progress} max="100" />
      </div>

      <Link to="/dashboard" className="btn-back-to-dashboard">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default OfflineLearning;
