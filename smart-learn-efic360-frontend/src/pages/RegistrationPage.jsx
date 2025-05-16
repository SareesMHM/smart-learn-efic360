// src/pages/RegistrationPage.jsx
import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistrationPage.scss';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    nic: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    gradeId: '',
    pdfFile: null,
    profileImage: null,
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'pdfFile' && files) {
      setFormData((prev) => ({ ...prev, pdfFile: files[0] }));
    } else if (name === 'profileImage' && files) {
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    } else if (name === 'gradeId') {
      setFormData((prev) => ({
        ...prev,
        gradeId: value === '' ? '' : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.nic ||
      !formData.dateOfBirth ||
      !formData.address ||
      !formData.phone ||
      !formData.parentName ||
      !formData.parentPhone ||
      !formData.gradeId
    ) {
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
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if ((key === 'pdfFile' || key === 'profileImage') && value instanceof File) {
            data.append(key, value);
          } else {
            data.append(key, value.toString());
          }
        }
      });

      const response = await authService.register(data, true);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />

        <label htmlFor="nic">NIC</label>
        <input
          id="nic"
          name="nic"
          type="text"
          placeholder="NIC"
          value={formData.nic}
          onChange={handleChange}
          required
        />

        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />

        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
          rows={3}
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label htmlFor="parentName">Parent/Guardian Name</label>
        <input
          id="parentName"
          name="parentName"
          type="text"
          placeholder="Parent/Guardian Name"
          value={formData.parentName}
          onChange={handleChange}
          required
        />

        <label htmlFor="parentPhone">Parent/Guardian Phone</label>
        <input
          id="parentPhone"
          name="parentPhone"
          type="tel"
          placeholder="Parent/Guardian Phone"
          value={formData.parentPhone}
          onChange={handleChange}
          required
        />

        <label htmlFor="gradeId">Grade</label>
        <select
          id="gradeId"
          name="gradeId"
          value={formData.gradeId}
          onChange={handleChange}
          required
        >
          <option value="">Select Grade</option>
          {[...Array(13)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{`Grade ${i + 1}`}</option>
          ))}
        </select>

        <label htmlFor="pdfFile">Upload Supporting Document (PDF)</label>
        <input
          id="pdfFile"
          name="pdfFile"
          type="file"
          accept="application/pdf"
          onChange={handleChange}
        />

        <label htmlFor="profileImage">Upload Profile Image</label>
        <input
          id="profileImage"
          name="profileImage"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />

        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default RegistrationPage;
