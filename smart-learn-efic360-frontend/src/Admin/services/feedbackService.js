// src/services/feedbackService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/feedback';

const tokenConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const submitFeedback = async (feedbackData) => {
  const res = await axios.post(API_URL, feedbackData, tokenConfig());
  return res.data;
};

const getAllFeedback = async () => {
  const res = await axios.get(API_URL, tokenConfig());
  return res.data;
};

const updateFeedbackStatus = async (id, status) => {
  const res = await axios.put(`${API_URL}/${id}/status`, { status }, tokenConfig());
  return res.data;
};

const assignFeedback = async (id, assigneeId) => {
  const res = await axios.put(`${API_URL}/${id}/assign`, { assigneeId }, tokenConfig());
  return res.data;
};

export default {
  submitFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  assignFeedback,
};
