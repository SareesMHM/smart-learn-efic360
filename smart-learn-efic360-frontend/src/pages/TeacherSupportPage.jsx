// src/pages/TeacherSupportPage.jsx
import React, { useEffect, useState } from 'react';
import teacherService from '../services/teacherService';
import '../styles/TeacherSupportPage.scss';

export default function TeacherSupportPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const data = await teacherService.getAssignments();
        setAssignments(data);
      } catch (err) {
        setError('Failed to load assignments.');
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="teacher-support-page">
      <h1>Teacher Support Dashboard</h1>

      <section className="assignments-section">
        <h2>Pending Assignments for Grading</h2>
        {assignments.length === 0 ? (
          <p>No assignments pending grading.</p>
        ) : (
          <ul className="assignment-list">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="assignment-item">
                <strong>{assignment.title}</strong> - {assignment.studentName}
                <button className="grade-btn">Grade</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add more teacher support tools here, like content recommendations */}
    </div>
  );
}
