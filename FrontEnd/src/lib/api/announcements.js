import { apiRequest } from './config';

// Announcements API
export const announcementsAPI = {
  // Get all announcements (admin)
  getAll: async () => {
    return apiRequest('/Announcements');
  },

  // Get active announcements (public)
  getActive: async () => {
    return apiRequest('/Announcements/active');
  },

  // Get announcement by ID
  getById: async (id) => {
    return apiRequest(`/Announcements/${id}`);
  },

  // Create announcement
  create: async (data) => {
    return apiRequest('/Announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update announcement
  update: async (id, data) => {
    return apiRequest(`/Announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete announcement
  delete: async (id) => {
    return apiRequest(`/Announcements/${id}`, {
      method: 'DELETE',
    });
  },
};





