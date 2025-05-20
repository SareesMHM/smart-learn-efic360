import { useEffect, useState } from 'react';
import axios from '../api/axios';

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch attendance data when the page loads
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/attendance'); // Your API endpoint
      setAttendanceData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch attendance data.');
      setLoading(false);
    }
  };

  return (
    <div className="attendance-page">
      <header className="header">
        <h2>Attendance Overview</h2>
      </header>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((attendance, index) => (
                <tr key={index}>
                  <td>{new Date(attendance.date).toLocaleDateString()}</td>
                  <td>{attendance.status}</td>
                  <td>{attendance.comment || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
