// src/pages/GradeClassManager.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const GradeClassManager = () => {
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ grade: '', teacherId: '', capacity: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchGrades();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await axios.get('/api/grades');
      console.log('Grades response:', res.data);
      // If your backend returns grades directly as an array
      setGrades(Array.isArray(res.data) ? res.data : res.data.grades || []);
    } catch (err) {
      console.error('Failed to fetch grades:', err);
      setGrades([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/admin/users?role=teacher');
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setTeachers([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/admin/users?role=student');
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/grades', formData);
      setMessage('Grade configuration saved.');
      fetchGrades();
    } catch (err) {
      console.error('Failed to submit grade:', err);
      setMessage('Failed to save grade.');
    }
  };

  return (
    <div className="grade-config-container">
      <h2>Grade & Class Configuration</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="grade"
          placeholder="Grade Level (e.g. Grade 1)"
          onChange={handleChange}
          required
        />
        <select name="teacherId" onChange={handleChange} required>
          <option value="">Assign Teacher</option>
          {Array.isArray(teachers) && teachers.map(t => (
            <option key={t._id} value={t._id}>{t.fullName}</option>
          ))}
        </select>
        <input
          name="capacity"
          type="number"
          placeholder="Max Capacity"
          onChange={handleChange}
          required
        />
        <button type="submit">Add Grade</button>
      </form>

      <h3>Existing Grades</h3>
      <table>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Teacher</th>
            <th>Capacity</th>
            <th>Students</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(grades) && grades.map(g => (
            <tr key={g._id}>
              <td>{g.grade}</td>
              <td>{teachers.find(t => t._id === g.teacherId)?.fullName || 'N/A'}</td>
              <td>{g.capacity}</td>
              <td>
                {Array.isArray(students) &&
                  students.filter(s => s.gradeId === g.grade).map(s => (
                    <div key={s._id}>{s.fullName}</div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradeClassManager;
