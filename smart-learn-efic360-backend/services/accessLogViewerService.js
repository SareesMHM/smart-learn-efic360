import axios from "axios";

// Axios instance so we can attach the token automatically
const api = axios.create({ baseURL: "/api" });

// Attach Authorization header for every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const API_BASE = "/admin/access-logs";

// Get all access logs (optionally with query params if your API supports them)
export const fetchAllLogs = async (params = {}) => {
  const res = await api.get(API_BASE, { params });
  return res.data;
};

// Get daily/weekly login stats
export const fetchLoginStats = async () => {
  const res = await api.get(`${API_BASE}/stats`);
  return res.data;
};

// Get suspicious activity alerts
export const fetchSuspiciousActivity = async () => {
  const res = await api.get(`${API_BASE}/suspicious`);
  return res.data;
};

// Export logs to Excel
export const exportLogsToExcel = async (params = {}) => {
  const res = await api.get(`${API_BASE}/export`, {
    params,
    responseType: "blob",
  });
  return res.data; // blob
};

const accessLogViewerService = {
  fetchAllLogs,
  fetchLoginStats,
  fetchSuspiciousActivity,
  exportLogsToExcel,
};

export default accessLogViewerService;
