import { apiRequest } from './config';

// Images API
export const imagesAPI = {
  // Upload image
  upload: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.productId) {
      formData.append('productId', options.productId);
    }
    if (options.categoryId) {
      formData.append('categoryId', options.categoryId);
    }
    if (options.altText) {
      formData.append('altText', options.altText);
    }
    if (options.title) {
      formData.append('title', options.title);
    }
    if (options.isPrimary !== undefined) {
      formData.append('isPrimary', options.isPrimary);
    }

    return apiRequest('/Images/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for FormData
      headers: {},
    });
  },

  // Get all images (optionally filtered by productId or categoryId)
  getAll: async (productId = null, categoryId = null) => {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (categoryId) params.append('categoryId', categoryId);
    
    const query = params.toString();
    return apiRequest(`/Images${query ? `?${query}` : ''}`);
  },

  // Get image by ID
  getById: async (id) => {
    return apiRequest(`/Images/${id}`);
  },

  // Delete image
  delete: async (id) => {
    return apiRequest(`/Images/${id}`, {
      method: 'DELETE',
    });
  },

  // Set image as primary
  setPrimary: async (id) => {
    return apiRequest(`/Images/${id}/set-primary`, {
      method: 'PUT',
    });
  },
};





