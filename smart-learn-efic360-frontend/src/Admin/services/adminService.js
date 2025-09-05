// src/services/adminService.js
import axios from 'axios';

/** Base URL:
 *  - Set VITE_API_BASE_URL to something like: http://localhost:5000/api
 *  - Falls back to http://localhost:5000/api
 */
const API_ROOT = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api')
  .replace(/\/+$/,''); // trim trailing slash

const API = axios.create({
  baseURL: `${API_ROOT}/admin`,
  withCredentials: true,           // needed if server uses httpOnly cookies
  timeout: 20000,
  // If you use csurf, keep these; otherwise they don't hurt
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Attach Bearer automatically if stored
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token && !cfg.headers.Authorization) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Utility: strip empty params
const toParams = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/* =========================
   Admin Users API
   ========================= */

// GET /api/admin/users?role=&q=&page=&limit=&sort=&isApproved=
export const getAllUsers = async ({
  role = 'all',
  q = '',
  page = 1,
  limit = 25,
  sort = '-createdAt',
  isApproved,
} = {}) => {
  const params = toParams({
    role: role === 'all' ? undefined : role,
    q, page, limit, sort, isApproved,
  });
  return (await API.get('/users', { params })).data; // -> { total, page, pages, perPage, data }
};

export const editUser  = async (id, payload) => (await API.put(`/users/${id}`, payload)).data;
export const deleteUser = async (id) => (await API.delete(`/users/${id}`)).data;

// Moderation (keep these routes in your server)
export const approveStudent = async (id) => (await API.post(`/users/${id}/approve`)).data;
export const rejectStudent  = async (id) => (await API.post(`/users/${id}/reject`)).data;

// Email
export const resendVerificationEmail = async (id) => (await API.post(`/users/${id}/resend`)).data;

// Optional helper for auth flows
export const setToken = (token) => {
  if (token) localStorage.setItem('access_token', token);
  else localStorage.removeItem('access_token');
};

export default {
  getAllUsers,
  editUser,
  deleteUser,
  approveStudent,
  rejectStudent,
  resendVerificationEmail,
  setToken,
};
