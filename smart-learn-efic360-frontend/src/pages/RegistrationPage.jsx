// src/pages/RegistrationPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';


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
    confirmPassword: '',
    profileImage: null,
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
     if (name === 'profileImage' && files) {
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
      !formData.confirmPassword ||
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
     //  Check if passwords match
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match.');
    setLoading(false);
    return;
  }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if ((key === 'profileImage') && value instanceof File) {
            data.append(key, value);
          } else {
            data.append(key, value.toString());
          }
        }
      });

const message = response.message || '';
      if (message === 'Admin Dashboard') {
        alert('Admin registered successfully. Redirecting to Admin Dashboard...');
        navigate('/admin');
      } else {
        alert('Registration successful. Please verify your email.');
        navigate('/StudentDashboard');
      }

    } catch (err) {
      if (err.response?.status === 409) {
        setError('Email already registered.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
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
         <label htmlFor="confirmPassword">confirmPassword</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="confirmPassword"
          placeholder="confirmPassword"
          value={formData.confirmPassword}
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

        <button type="submit" disabled={loading} onClick={handleSubmit}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default RegistrationPage;
