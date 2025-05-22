// src/pages/CourseManager.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({ subject: '', teacherId: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchTeachers()]);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch initial data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/courses'); // update this URL to your actual backend
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
      setError('Could not load courses.');
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/admin/users?role=teacher');
      setTeachers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setTeachers([]);
      setError('Could not load teachers.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await axios.put(`http://localhost:3000/api/courses/${editingCourse._id}`, formData);
        setMessage('Course updated successfully.');
      } else {
        await axios.post('http://localhost:3000/api/courses', formData);
        setMessage('Course added successfully.');
      }
      setFormData({ subject: '', teacherId: '' });
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      setMessage('Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`http://localhost:3000/api/courses/${id}`);
        fetchCourses();
        setMessage('Course deleted.');
      } catch (err) {
        console.error(err);
        setMessage('Failed to delete course.');
      }
    }
  };

  const filteredCourses = courses.filter(c =>
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="course-manager">
      <h2>Course Management</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="subject"
          placeholder="Subject Name"
          value={formData.subject}
          onChange={handleChange}
          required
        />
        <select name="teacherId" value={formData.teacherId} onChange={handleChange} required>
          <option value="">Assign Teacher</option>
          {teachers.map(t => (
            <option key={t._id} value={t._id}>{t.fullName}</option>
          ))}
        </select>
        <button type="submit">{editingCourse ? 'Update' : 'Add'} Course</button>
      </form>

      <input
        type="text"
        placeholder="Search by subject"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <ul>
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <li key={course._id}>
              <strong>{course.subject}</strong> — Teacher: {course.teacherName || 'Unassigned'}
              <button
                onClick={() => {
                  setEditingCourse(course);
                  setFormData({ subject: course.subject, teacherId: course.teacherId });
                }}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(course._id)}>Delete</button>
            </li>
          ))
        ) : (
          <li>No courses found.</li>
        )}
      </ul>
    </div>
  );
};

export default CourseManager;
