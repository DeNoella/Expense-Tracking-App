import { apiRequest } from './config';

// Analytics API
export const analyticsAPI = {
  // Get product statistics
  getProductStats: async () => {
    return apiRequest('/Analytics/product-stats');
  },

  // Get sales by category
  getSalesByCategory: async () => {
    return apiRequest('/Analytics/sales-by-category');
  },

  // Get top selling products
  getTopSellingProducts: async (limit = 5) => {
    return apiRequest(`/Analytics/top-selling-products?limit=${limit}`);
  },

  // Get sales trend
  getSalesTrend: async (months = 6) => {
    return apiRequest(`/Analytics/sales-trend?months=${months}`);
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 50) => {
    return apiRequest(`/Analytics/low-stock-products?threshold=${threshold}`);
  },

  // Get top reviewed products
  getTopReviewedProducts: async (limit = 10) => {
    return apiRequest(`/Analytics/top-reviewed-products?limit=${limit}`);
  },
};





