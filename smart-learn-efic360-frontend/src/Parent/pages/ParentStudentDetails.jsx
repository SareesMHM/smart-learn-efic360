import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


const ParentStudentDetails = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`/api/parent/student/${studentId}/details`);
        setStudent(res.data);
      } catch (err) {
        setError('Failed to load student details');
      }
    };
    fetchDetails();
  }, [studentId]);

  if (error) return <p className="error">{error}</p>;
  if (!student) return <p>Loading...</p>;

  return (
    <div className="student-details">
      <h2>{student.name}</h2>
      <p>Grade: {student.grade}</p>

      <div className="section">
        <h3>Attendance</h3>
        <table>
          <thead>
            <tr><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {student.attendance.map((entry, index) => (
              <tr key={index} className={entry.status.toLowerCase()}>
                <td>{entry.date}</td>
                <td>{entry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3>Grades</h3>
        <table>
          <thead>
            <tr><th>Subject</th><th>Score</th></tr>
          </thead>
          <tbody>
            {student.grades.map((grade, index) => (
              <tr key={index}>
                <td>{grade.subject}</td>
                <td>{grade.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParentStudentDetails;
