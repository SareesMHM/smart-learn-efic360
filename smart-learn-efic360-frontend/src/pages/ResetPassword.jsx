// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if(password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post(`/auth/reset-password/${token}`, { password });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {message && <p style={{color: 'green'}}>{message}</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          required
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
