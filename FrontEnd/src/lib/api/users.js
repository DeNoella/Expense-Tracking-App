import { apiRequest } from "./config";

// Users API
export const usersAPI = {
  // Get all users (admin)
  getAll: async () => {
    return apiRequest("/Users");
  },

  // Get user by ID
  getById: async (id) => {
    return apiRequest(`/Users/${id}`);
  },

  // Update user
  update: async (id, data) => {
    return apiRequest(`/Users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete user
  delete: async (id) => {
    return apiRequest(`/Users/${id}`, {
      method: "DELETE",
    });
  },

  // Assign permissions to user
  assignPermissions: async (userId, permissions) => {
    return apiRequest(`/Permissions/${userId}`, {
      method: "POST",
      body: JSON.stringify({ permissions }),
    });
  },
};
