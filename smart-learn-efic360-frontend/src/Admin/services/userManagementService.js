// src/services/userManagementService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/admin';

const getUsersByRole = async (role) => {
  const res = await axios.get(`${API_BASE}/users?role=${role}`);
  return res.data.users;
};

const approveStudent = async (id) => {
  const res = await axios.put(`${API_BASE}/students/${id}/approve`);
  return res.data;
};

const rejectStudent = async (id) => {
  const res = await axios.delete(`${API_BASE}/students/${id}/reject`);
  return res.data;
};

const resendEmailVerification = async (id) => {
  const res = await axios.post(`${API_BASE}/resend-email/${id}`);
  return res.data;
};

const editUser = async (id, updatedData) => {
  const res = await axios.put(`${API_BASE}/users/${id}`, updatedData);
  return res.data;
};

const deleteUser = async (id) => {
  const res = await axios.delete(`${API_BASE}/users/${id}`);
  return res.data;
};

export default {
  getUsersByRole,
  approveStudent,
  rejectStudent,
  resendEmailVerification,
  editUser,
  deleteUser,
};
