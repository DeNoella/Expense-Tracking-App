import { apiRequest } from './config';

// Issues/Refunds API
export const issuesAPI = {
  // Get all issues (admin)
  getAll: async () => {
    return apiRequest('/Issues');
  },

  // Get my issues
  getMyIssues: async () => {
    return apiRequest('/Issues/me');
  },

  // Create issue (refund request)
  create: async (data) => {
    return apiRequest('/Issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update issue status
  update: async (id, data) => {
    return apiRequest(`/Issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};





