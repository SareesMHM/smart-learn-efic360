// src/services/adminService.js
import axios from 'axios';

// Create a single axios instance for all admin calls
const API = axios.create({
  baseURL:
    (import.meta.env?.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')}/api/admin`
      : 'http://localhost:5000/api/admin'),
  withCredentials: true, // needed if your server sets httpOnly auth cookies
  timeout: 20000,
});

// Optional: also send Bearer token if you store one
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Helper to strip empty params
const toParams = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );

// ------- CRUD -------

// Create user (accepts FormData OR plain object). Do NOT set multipart header manually.
const addUser = async (data) => (await API.post('/users', data)).data;

// Unified list (server-side pagination + search)
// GET /api/admin/users?role=all&q=&page=1&limit=10&sort=-createdAt&isApproved=true
// -> { total, page, pages, perPage, data }
const getAllUsers = async ({
  role = 'all',
  q = '',
  page = 1,
  limit = 25,
  sort = '-createdAt',
  isApproved,
} = {}) => {
  const roleParam = role === 'all' ? undefined : role;
  const params = toParams({ role: roleParam, q, page, limit, sort, isApproved });
  return (await API.get('/users', { params })).data;
};

// Backward-compat helper: returns just the array for a role
const getUsersByRole = async (role) => {
  const res = await getAllUsers({ role, limit: 1000 }); // adjust limit as needed
  return Array.isArray(res) ? res : res.data; // normalize legacy vs paginated
};

const editUser = async (id, payload) => (await API.put(`/users/${id}`, payload)).data;

const deleteUser = async (id) => (await API.delete(`/users/${id}`)).data;

// ------- Student moderation -------
const approveStudent = async (id) => (await API.put(`/students/${id}/approve`)).data;

const rejectStudent = async (id) => (await API.delete(`/students/${id}/reject`)).data;

// ------- Email -------
const resendVerificationEmail = async (id) => (await API.post(`/resend-email/${id}`)).data;

export default {
  addUser,
  getAllUsers,
  getUsersByRole,
  editUser,
  deleteUser,
  approveStudent,
  rejectStudent,
  resendVerificationEmail,
};
