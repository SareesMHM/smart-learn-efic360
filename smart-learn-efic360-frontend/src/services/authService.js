// src/services/authService.js
import axios from './api'; // Axios instance configured with baseURL

/**
 * Login user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} User data and token
 */
const login = async (email, password) => {
  const response = await axios.post('/auth/login', { email, password });
  return response.data; // expected { token, user }
};

/**
 * Register a new user
 * @param {Object} userData - { name, email, password, role }
 * @returns {Promise<Object>} User data and token
 */
const register = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  return response.data; // expected { token, user }
};

export default {
  login,
  register,
};
