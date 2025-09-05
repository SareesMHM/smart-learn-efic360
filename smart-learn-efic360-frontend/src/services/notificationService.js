// services/notificationService.js
import axios from 'axios';

// --- Admin-side API (protected by isAdmin) ---
export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL_ADMIN || 'http://localhost:5000/api/admin',
  withCredentials: true,
  timeout: 15000,
});

// --- User-side API (logged-in users) ---
export const userApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL_NOTIF || 'http://localhost:5000/api/notifications',
  withCredentials: true,
  timeout: 15000,
});

// Optional: tiny response error normalizer
const onError = (error) => {
  // surface server's message if present
  const msg = error?.response?.data?.message || error.message || 'Request failed';
  return Promise.reject(new Error(msg));
};
adminApi.interceptors.response.use((r) => r, onError);
userApi.interceptors.response.use((r) => r, onError);

// ======================= ADMIN =======================

// Create a material-related notification (user/users/bucket/all)
export const createMaterialNotification = (payload) =>
  adminApi.post('/notifications/material', payload);

// List notifications (requires routes + controller: adminList)
export const adminListNotifications = (params) =>
  adminApi.get('/notifications', { params });

// Delete a notification by id (requires routes + controller: adminDelete)
export const adminDeleteNotification = (id) =>
  adminApi.delete(`/notifications/${id}`);


// ======================== USER ========================

// Get my notifications (supports ?type=&limit=&before=)
export const listMyNotifications = (params) =>
  userApi.get('/my', { params });

// Mark a notification as read (adds me to readBy)
export const markNotificationRead = (id) =>
  userApi.patch(`${id}/read`);
