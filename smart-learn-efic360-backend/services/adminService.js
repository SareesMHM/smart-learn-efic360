// src/services/adminService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/admin';


const addUser = async (data) => {
  const res = await axios.post(`${API_BASE}/users`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

const getUsersByRole = async (role) => {
  const response = await axios.get(`${API_BASE}/users?role=${role}`);
  return response.data.users;
};

const approveStudent = async (id) => {
  const response = await axios.put(`${API_BASE}/students/${id}/approve`);
  return response.data;
};

const rejectStudent = async (id) => {
  const response = await axios.delete(`${API_BASE}/students/${id}/reject`);
  return response.data;
};

const resendVerificationEmail = async (id) => {
  const response = await axios.post(`${API_BASE}/resend-email/${id}`);
  return response.data;
};

export default {
    addUser,
  getUsersByRole,
  approveStudent,
  rejectStudent,
  resendVerificationEmail,
};
