
import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { login } from '../services/authService';

import { useMutation } from '@tanstack/react-query';


const LoginPage = () => {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: () => login(emailOrId,password),
    onSuccess: (data) => {
     const { token:accessToken, USER:user } = data;
      // localStorage.setItem('token', accessToken);
      // localStorage.setItem('user', JSON.stringify(user));

      if(user.isvalidEmail)
      {
        if (user.role === 'student') {
          navigate('/StudentDashboard');
        } else if (user.role === 'teacher') {
          navigate('/TeacherDashboard');
          
        } else if (user.role === 'admin') {
          navigate('/AdminDashboard');
        }
        else if (user.role === 'parent') {
          navigate('/ParentDashboard');
        } else {
          navigate('/');
        }
      }
      else{
        navigate('/SendVerification',{
          state:{
            user:data
          }
        });
      }
    },
    onError: (err) => {
      console.log(err)
      setError(err.response?.data?.message || 'Login failed.');
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!emailOrId.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      mutation.mutate();
    } catch (err) {
      const message = err?.response?.data?.message;
      if (message === 'Email or ID does not exist') {
        setError('The provided Email or ID is not registered.');
      } else if (message === 'Incorrect password') {
        setError('The password you entered is incorrect.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

   
  return (
    <div className="login-page">     

      <form onSubmit={handleLogin} className="login-form" noValidate>
        <h2 className="login-title">
          Sign in to <span className="highlight">EFIC</span>
        </h2>

        {error && <p className="error-message">{error}</p>}

        <div className="input-group">
          <FiMail className="icon" />
          <input
            type="text"
            placeholder="Email or ID"
            value={emailOrId}
            onChange={(e) => setEmailOrId(e.target.value)}
            className="input"
            autoComplete="username"
          />
        </div>

        <div className="input-group">
          <FiLock className="icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-password"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="forgot-password">
          <a href="/ForgotPassword">Forgot Password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn-submit ${loading ? 'loading' : ''}`} 
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <div class="new-account">
								Don't have an account yet?
								<a href="/registration">
									Create an account
								</a>
							</div>

        
      </form>
    </div>
  );
};

export default LoginPage;
