import { apiRequest } from './config';

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    return apiRequest('/Categories');
  },

  // Create category
  create: async (data) => {
    return apiRequest('/Categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update category
  update: async (id, data) => {
    return apiRequest(`/Categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete category
  delete: async (id) => {
    return apiRequest(`/Categories/${id}`, {
      method: 'DELETE',
    });
  },
};





