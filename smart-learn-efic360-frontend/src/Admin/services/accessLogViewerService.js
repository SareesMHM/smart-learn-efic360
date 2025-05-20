import axios from 'axios';

const API_BASE = '/api/access-logs';

//  Include token in every request
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

//  Get all access logs
export const fetchAllLogs = async () => {
  const res = await axios.get(`${API_BASE}`, getAuthHeaders());
  return res.data;
};

//  Get daily/weekly login stats
export const fetchLoginStats = async () => {
  const res = await axios.get(`${API_BASE}/stats`, getAuthHeaders());
  return res.data;
};

//  Get suspicious activity alerts
export const fetchSuspiciousActivity = async () => {
  const res = await axios.get(`${API_BASE}/suspicious`, getAuthHeaders());
  return res.data;
};

//  Export logs to Excel
export const exportLogsToExcel = async () => {
  const res = await axios.get(`${API_BASE}/export`, {
    ...getAuthHeaders(),
    responseType: 'blob',
  });
  return res.data; // return blob to handle download in frontend
};

const accessLogViewerService = {
  fetchAllLogs,
  fetchLoginStats,
  fetchSuspiciousActivity,
  exportLogsToExcel,
};

export default accessLogViewerService;
