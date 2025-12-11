import { apiRequest } from './config';

// Discounts API
export const discountsAPI = {
  // Get all discounts
  getAll: async () => {
    return apiRequest('/Discounts');
  },

  // Get discount by ID
  getById: async (id) => {
    return apiRequest(`/Discounts/${id}`);
  },

  // Create discount
  create: async (data) => {
    return apiRequest('/Discounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update discount
  update: async (id, data) => {
    return apiRequest(`/Discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete discount
  delete: async (id) => {
    return apiRequest(`/Discounts/${id}`, {
      method: 'DELETE',
    });
  },
};





