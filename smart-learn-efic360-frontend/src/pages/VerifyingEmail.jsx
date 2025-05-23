import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// import { verifyEmail } from '../features/auth/'; // Adjust path as needed
import icon from "../images/efic-icon-512.png" // Adjust this to your actual image path

const VerifyingEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useParams();

  const { user, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) return navigate('/register/verify/email');
    dispatch(verifyEmail(token));
  }, [dispatch, navigate, token]);

  useEffect(() => {
    if (error) {
      navigate('/register/verify/email');
    }
  }, [error, navigate]);

  return (
    <center>
      <div className="container">
        <div className="frame">
          <img src={icon} alt="Verified" className="round-image" style={{ position: 'relative', right: '80px' }} />
          <center>
            <h1>Email Verified</h1>
            <p>Your email address was successfully verified</p>
            <Link to={
              user?.role === 'Admin' ? '/admin' :
              user?.role === 'Student' ? '/StudentDashboard' : '/'
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
