import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
// import { verifyEmail } from '../features/auth/'; // Adjust path as needed
import icon from "../images/efic-icon-512.png" // Adjust this to your actual image path
import { verifyEmail } from '../services/authService';
import { useMutation } from '@tanstack/react-query';

const VerifyingEmail = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const role = localStorage.getItem('role');
  const verifyingEmailMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => toast.success(data.message),
    onError: () => 
      {
      toast.error('Failed to resend email.')
      navigate('/register/verify/email');
      }
  });

  useEffect(() => {
    if (!token) return navigate('/register/verify/email');
   verifyingEmailMutation.mutate(token);
  }, [navigate, token]);


  return (
    <center>
      <div className="container">
        <div className="frame">
          <img src={icon} alt="Verified" className="round-image" style={{ position: 'relative', right: '80px' }} />
          <center>
            <h1>Email Verified</h1>
            <p>Your email address was successfully verified</p>
            <Link to={
              role === 'admin' ? '/admin' :
              role === 'student' ? '/StudentDashboard' : '/'
            }>
              Back to Home
            </Link>
          </center>
        </div>
      </div>
    </center>
  );
};

export default VerifyingEmail;
