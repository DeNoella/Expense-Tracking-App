import { apiRequest } from './config';

// Payment Methods API
export const paymentMethodsAPI = {
  // Get all payment methods
  getAll: async () => {
    return apiRequest('/PaymentMethods');
  },

  // Get payment method by ID
  getById: async (id) => {
    return apiRequest(`/PaymentMethods/${id}`);
  },

  // Create payment method
  create: async (data) => {
    return apiRequest('/PaymentMethods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update payment method
  update: async (id, data) => {
    return apiRequest(`/PaymentMethods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete payment method
  delete: async (id) => {
    return apiRequest(`/PaymentMethods/${id}`, {
      method: 'DELETE',
    });
  },
};





