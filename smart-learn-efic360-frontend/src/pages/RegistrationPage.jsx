// src/pages/RegistrationPage.jsx
import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic client-side validation (expand as needed)
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const data = await authService.register(formData);
      localStorage.setItem('token', data.token);
      navigate('/dashboard'); // Redirect after successful registration
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 20, padding: 8 }}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  );
}
