// src/pages/CourseManager.jsx
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const SUBJECTS = ["English", "Maths", "Tamil", "Science", "History", "IT"];
const GRADES = [6, 7, 8, 9, 10, 11];

const initialForm = { subject: '', grade: '', teacherId: '' };

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState(initialForm);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  const [editingCourse, setEditingCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // debounce search
  const [q, setQ] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQ(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchTeachers()]);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch initial data.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
      setError('Could not load courses.');
    }
  }

  async function fetchTeachers() {
    try {
      const res = await axios.get('/api/admin/users', { params: { role: 'teacher' } });
      setTeachers(res?.data.data || []);
    } catch (err) {
      console.error(err);
      setTeachers([]);
      setError('Could not load teachers.');
    }
  }

  const teacherNameById = (id) => {
    if (!id) return 'Unassigned';
    const t = teachers.find(x => x._id === id);
    return t?.fullName || t?.name || 'Unassigned';
  };

  const filteredCourses = useMemo(() => {
    const term = q.toLowerCase();
    return (courses || [])
      .filter(c => (filterSubject ? c.subject === filterSubject : true))
      .filter(c => (filterGrade ? String(c.grade) === String(filterGrade) : true))
      .filter(c =>
        !term
          ? true
          : (c.subject || '').toLowerCase().includes(term) ||
            String(c.grade || '').toLowerCase().includes(term) ||
            (c.teacherName || teacherNameById(c.teacherId)).toLowerCase().includes(term)
      )
      .sort((a, b) => {
        // sort by subject then grade
        if (a.subject === b.subject) return Number(a.grade || 0) - Number(b.grade || 0);
        return a.subject?.localeCompare(b.subject || '') || 0;
      });
  }, [courses, q, filterSubject, filterGrade, teachers]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'grade' ? Number(value) || '' : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.subject) return setError('Please select a subject.');
    if (!formData.grade) return setError('Please select a grade.');
    if (!formData.teacherId) return setError('Please select a teacher.');

    try {
      setSubmitting(true);
      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse._id}`, formData);
        setMessage('Course updated successfully.');
      } else {
        await axios.post('/api/courses', formData);
        setMessage('Course added successfully.');
      }
      setFormData(initialForm);
      setEditingCourse(null);
      await fetchCourses();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this course?')) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      setMessage('Course deleted.');
      await fetchCourses();
    } catch (err) {
      console.error(err);
      setError('Failed to delete course.');
    }
  }

  function beginEdit(course) {
    setEditingCourse(course);
    setFormData({
      subject: course.subject || '',
      grade: course.grade ?? '',
      teacherId: course.teacherId || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setFormData(initialForm);
    setEditingCourse(null);
    setMessage('');
    setError('');
  }


  return (
    <div className="course-manager container">
      <h2>Class Management</h2>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="cm-toast" style={{ borderLeftColor: '#dc2626' }}>{error}</p>}
      {message && <p className="cm-toast" style={{ borderLeftColor: '#16a34a' }}>{message}</p>}

      {/* Create / Edit */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="grid" style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <div>
            <label>Subject<span className="req">*</span></label>
            <select name="subject" value={formData.subject} onChange={handleChange} required>
              <option value="">Select subject…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label>Grade<span className="req">*</span></label>
            <select name="grade" value={formData.grade} onChange={handleChange} required>
              <option value="">Select grade…</option>
              {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>

          <div>
            <label>Assign Teacher<span className="req">*</span></label>
            <select name="teacherId" value={formData.teacherId} onChange={handleChange} required>
              <option value="">Select teacher…</option>
              
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.fullName || t.name}</option>
              ))}
            </select>
          </div>

          <div style={{ alignSelf: 'end', display: 'flex', gap: '.5rem' }}>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? (editingCourse ? 'Updating…' : 'Adding…') : (editingCourse ? 'Update' : 'Add') + ' Course'}
            </button>
            <button type="button" className="btn ghost" onClick={resetForm} disabled={submitting}>
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="row" style={{ display: 'flex', gap: '.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search by subject / grade / teacher"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="cm-search"
          style={{ flex: '1 1 280px' }}
        />
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          <option value="">All subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
          <option value="">All grades</option>
          {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <button className="btn ghost" onClick={() => { setFilterSubject(''); setFilterGrade(''); setSearchTerm(''); }}>
          Clear
        </button>
      </div>

      {/* List */}
      <div className="card" style={{ padding: '1rem' }}>
        {filteredCourses.length === 0 ? (
          <p className="muted">No courses found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Grade</th>
                <th>Teacher</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course._id}>
                  <td>
                    <span className="pill">{course.subject}</span>
                  </td>
                  <td>
                    <span className="pill">Grade {course.grade}</span>
                  </td>
                  <td>{course.teacherId.fullName || teacherNameById(course.teacherId.fullName)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="btn sm" onClick={() => beginEdit(course)}>Edit</button>
                      <button className="btn danger sm" onClick={() => handleDelete(course._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
