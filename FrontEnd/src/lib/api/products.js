import { apiRequest } from './config';

// Products API
export const productsAPI = {
  // Get all products
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    // Support both categoryId (int) and category (enum) for backward compatibility
    if (params.categoryId !== undefined) queryParams.append('categoryId', params.categoryId);
    if (params.category !== undefined) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/Products?${queryString}` : '/Products';
    
    return apiRequest(url);
  },

  // Get product by ID
  getById: async (id) => {
    return apiRequest(`/Products/${id}`);
  },

  // Create product
  create: async (data) => {
    return apiRequest('/Products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update product
  update: async (id, data) => {
    return apiRequest(`/Products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete product
  delete: async (id) => {
    return apiRequest(`/Products/${id}`, {
      method: 'DELETE',
    });
  },
};




