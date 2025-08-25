// src/api/axios.js
import axios from 'axios';

// Create an axios instance with your backend base URL
const instance = axios.create({
  baseURL:'http://localhost:5000/api',
   withCredentials: true ,
});

// // Optional: add interceptors if needed (e.g., attach token)
// instance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default instance;
