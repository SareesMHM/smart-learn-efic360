// src/services/reportAnalyticsService.js
import axios from 'axios';

const API_BASE = '/api/reports';

const reportAnalyticsService = {
  fetchReportData: async (filters = {}) => {
    const res = await axios.get(API_BASE, { params: filters });
    return res.data;
  },

  exportToPDF: async (filters = {}) => {
    const res = await axios.post(`${API_BASE}/export`, filters, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
    return res.data;
  },

  exportToExcel: async (filters = {}) => {
    const res = await axios.post(`${API_BASE}/export`, { ...filters, format: 'excel' }, {
      responseType: 'blob',
      headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    });
    return res.data;
  },
};

export default reportAnalyticsService;
