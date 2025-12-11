import { apiRequest } from './config';

// System API
export const systemAPI = {
  // Get system health
  getHealth: async () => {
    return apiRequest('/System/health');
  },

  // Get system alerts
  getAlerts: async () => {
    return apiRequest('/System/alerts');
  },

  // Get performance metrics
  getPerformance: async () => {
    return apiRequest('/System/performance');
  },
};





