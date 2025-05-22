import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from '../api/axios';


const PerformanceAnalyticsPage = () => {
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const res = await axios.get('/api/performance');
      setPerformanceData(res.data);
    } catch (err) {
      console.error('Error fetching performance data', err);
    }
  };

  const chartData = {
    labels: performanceData ? performanceData.subjects : [],
    datasets: [
      {
        label: 'Score',
        data: performanceData ? performanceData.scores : [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <div className="performance-analytics-page">
    

      <h2 className="title">Performance Analytics</h2>

      {performanceData ? (
        <div className="charts-container">
          <div className="chart-card">
            <h3>Performance Over Subjects</h3>
            <Bar data={chartData} options={chartOptions} />
          </div>

          {/* Additional Analytics Components */}
          <div className="additional-analytics">
            <h3>Quiz Performance</h3>
            <p>Average Score: {performanceData.averageScore}%</p>
            <p>Best Subject: {performanceData.bestSubject}</p>
            <p>Areas to Improve: {performanceData.weakestSubject}</p>
          </div>
        </div>
      ) : (
        <p>Loading performance data...</p>
      )}
    </div>
  );
};

export default PerformanceAnalyticsPage;
