import { apiRequest } from './config';

// Dashboard API
export const dashboardAPI = {
  // Get dashboard summary
  getSummary: async () => {
    return apiRequest('/Dashboard/summary');
  },
};





