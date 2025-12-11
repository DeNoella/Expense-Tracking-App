import { apiRequest } from './config';

// Orders API
export const ordersAPI = {
  // Get all orders (admin)
  getAll: async () => {
    return apiRequest('/Orders');
  },

  // Get my orders
  getMyOrders: async () => {
    return apiRequest('/Orders/me');
  },

  // Get order by ID
  getById: async (id) => {
    return apiRequest(`/Orders/${id}`);
  },

  // Checkout (create order)
  checkout: async (data) => {
    return apiRequest('/Orders/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update order status
  updateStatus: async (id, status) => {
    return apiRequest(`/Orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};





