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
    const res = await axios.get('/api/grades');
    setGrades(res.data.grades); //  safely extract array

  };

  const fetchTeachers = async () => {
    const res = await axios.get('/api/admin/users?role=teacher');
    setTeachers(res.data);
  };

  const fetchStudents = async () => {
    const res = await axios.get('/api/admin/users?role=student');
    setStudents(res.data);
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
    } catch {
      setMessage('Failed to save grade.');
    }
  };

  return (
    <div className="grade-config-container">
      <h2>Grade & Class Configuration</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input name="grade" placeholder="Grade Level (e.g. Grade 1)" onChange={handleChange} required />
        <select name="teacherId" onChange={handleChange} required>
          <option value="">Assign Teacher</option>
          {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
        </select>
        <input name="capacity" type="number" placeholder="Max Capacity" onChange={handleChange} required />
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
          {grades.map(g => (
            <tr key={g._id}>
              <td>{g.grade}</td>
              <td>{teachers.find(t => t._id === g.teacherId)?.fullName || 'N/A'}</td>
              <td>{g.capacity}</td>
              <td>
                {students.filter(s => s.gradeId === g.grade).map(s => (
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
