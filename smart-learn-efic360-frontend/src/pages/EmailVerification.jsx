// src/pages/EmailVerification.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying...');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid verification link.');
      setStatus('');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/auth/verify-email`,
          { token }
        );
        if (response.data.success) {
          setStatus('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setError('Verification failed. The link may be expired or invalid.');
          setStatus('');
        }
      } catch (err) {
        setError('Verification error. Please try again later.');
        setStatus('');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, textAlign: 'center' }}>
      {status && <p>{status}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
