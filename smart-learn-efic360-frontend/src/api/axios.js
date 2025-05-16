// src/api/axios.js
import axios from 'axios';

// Create an axios instance with your backend base URL
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  // You can add headers, timeout etc. here
  // headers: { 'Content-Type': 'application/json' },
  // timeout: 10000,
});

// Optional: add interceptors if needed (e.g., attach token)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
