import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components once
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Skeleton = () => (
  <div role="status" aria-live="polite" className="animate-pulse space-y-4">
    <div className="h-6 w-48 bg-gray-200 rounded" />
    <div className="h-64 bg-gray-200 rounded" />
    <div className="h-20 bg-gray-200 rounded" />
  </div>
);

export default function PerformanceAnalyticsPage() {
  const [performance, setPerformance] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/performance');
        // Defensive defaults
        const fallback = {
          subjects: [],
          scores: [],
          averageScore: 0,
          bestSubject: '-',
          weakestSubject: '-',
        };
        setPerformance({ ...fallback, ...data });
      } catch (e) {
        console.error('Error fetching performance data', e);
        setErr('Could not load performance data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chartData = useMemo(() => ({
    labels: performance?.subjects ?? [],
    datasets: [
      {
        label: 'Score',
        data: performance?.scores ?? [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }), [performance]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Score (%)' } },
      x: { title: { display: true, text: 'Subjects' } },
    },
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false },
    },
  }), []);

  const empty = !loading && !err && performance && performance.subjects.length === 0;

  return (
    <div className="performance-analytics-page max-w-5xl mx-auto p-4 space-y-6">
      <h2 className="title text-2xl font-semibold">Performance Analytics</h2>

      {loading && <Skeleton />}

      {err && (
        <div className="p-4 border border-red-300 rounded text-red-700 bg-red-50">
          {err}
        </div>
      )}

      {empty && (
        <div className="p-4 border rounded bg-gray-50">
          No performance records yet. Complete a quiz to see analytics here.
        </div>
      )}

      {!loading && !err && !empty && performance && (
        <div className="charts-container grid gap-6 md:grid-cols-3">
          <div className="chart-card md:col-span-2 p-4 border rounded">
            <h3 className="mb-3 font-medium">Performance Over Subjects</h3>
            <div style={{ height: 360 }}>
              <Bar data={chartData} options={chartOptions} aria-label="Subject performance bar chart" />
            </div>
          </div>

          <div className="additional-analytics p-4 border rounded">
            <h3 className="mb-3 font-medium">Quiz Performance</h3>
            <ul className="space-y-1">
              <li><strong>Average Score:</strong> {Number(performance.averageScore ?? 0).toFixed(1)}%</li>
              <li><strong>Best Subject:</strong> {performance.bestSubject || '-'}</li>
              <li><strong>Areas to Improve:</strong> {performance.weakestSubject || '-'}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
