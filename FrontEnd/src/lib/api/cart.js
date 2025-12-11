import { apiRequest } from './config';

// Cart API
export const cartAPI = {
  // Get cart
  get: async () => {
    return apiRequest('/Cart');
  },

  // Add item to cart
  addItem: async (productId, quantity) => {
    return apiRequest('/Cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Update cart item quantity
  updateItem: async (productId, quantity) => {
    return apiRequest('/Cart/items', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Remove item from cart
  removeItem: async (productId) => {
    return apiRequest(`/Cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  // Clear cart
  clear: async () => {
    return apiRequest('/Cart', {
      method: 'DELETE',
    });
  },
};





