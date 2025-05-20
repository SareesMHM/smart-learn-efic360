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

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    const res = await axios.get('/api/courses');
    setCourses(res.data);
  };

  const fetchTeachers = async () => {
    const res = await axios.get('/api/admin/users?role=teacher');
    setTeachers(res.data.users);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse._id}`, formData);
        setMessage('Course updated.');
      } else {
        await axios.post('/api/courses', formData);
        setMessage('Course added.');
      }
      setFormData({ subject: '', teacherId: '' });
      setEditingCourse(null);
      fetchCourses();
    } catch {
      setMessage('Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this course?')) {
      await axios.delete(`/api/courses/${id}`);
      fetchCourses();
    }
  };

  const filteredCourses = courses.filter(c =>
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="course-manager">
      <h2>Course Management</h2>
      {message && <p>{message}</p>}

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
        placeholder="Search Subject"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <ul>
        {filteredCourses.map(course => (
          <li key={course._id}>
            <strong>{course.subject}</strong> — Teacher: {course.teacherName}
            <button onClick={() => setEditingCourse(course) || setFormData({ subject: course.subject, teacherId: course.teacherId })}>Edit</button>
            <button onClick={() => handleDelete(course._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseManager;
