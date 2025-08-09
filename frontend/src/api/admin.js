// frontend/src/api/admin.js
import API from "./axios";

// Fetches the current admin user's profile
export const getAdminProfile = async () => {
  try {
    const res = await API.get("/admin/profile");
    return res.data;
  } catch (error) {
    console.error("API Error: Failed to fetch admin profile", error);
    throw error;
  }
};

// Fetches dashboard statistics for the admin panel
export const getAdminDashboardStats = async () => {
  try {
    const res = await API.get("/admin/dashboard-stats"); // Ensure your backend route is '/admin/dashboard-stats'
    return res.data;
  } catch (error) {
    console.error("API Error: Failed to fetch admin dashboard stats", error);
    throw error;
  }
};

// Updates an educator's status (e.g., approve)
export const updateEducatorStatus = async (educatorId, status) => {
  try {
    const res = await API.put(`/admin/educators/${educatorId}/status`, { status });
    return res.data;
  } catch (error) {
    console.error(`API Error: Failed to update educator ${educatorId} status to ${status}`, error);
    throw error;
  }
};

// Fetches all users for the admin panel
export const getAllUsers = async () => {
  try {
    const res = await API.get("/admin/users");
    return res.data;
  } catch (error) {
    console.error("API Error: Failed to fetch all users for admin panel", error);
    throw error;
  }
};

// Fetches a single user by ID for the admin panel (if needed)
export const getUserById = async (id) => {
  try {
    const res = await API.get(`/admin/users/${id}`);
    return res.data;
  } catch (error) {
    console.error(`API Error: Failed to fetch user by ID ${id}`, error);
    throw error;
  }
};

// Deletes a user
export const deleteUser = async (id) => {
  try {
    const res = await API.delete(`/admin/users/${id}`);
    return res.data;
  } catch (error) {
    console.error(`API Error: Failed to delete user ${id}`, error);
    throw error;
  }
};

// Updates a user's role (e.g., 'admin', 'student', 'educator')
export const updateUserRole = async (userId, newRole) => {
  try {
    const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
    return res.data;
  } catch (error) {
    console.error(`API Error: Failed to update user ${userId} role to ${newRole}`, error);
    throw error;
  }
};

// Fetches all courses for the admin panel
export const getAllCourses = async () => {
  try {
    const res = await API.get("/admin/courses");
    return res.data;
  } catch (error) {
    console.error("API Error: Failed to fetch all courses for admin panel", error);
    throw error;
  }
};

// Toggles a course's published status (publish/unpublish)
// --- FIX IS HERE: Changed payload key from 'is_published' to 'status' ---
export const toggleCourseStatus = async (courseId, newStatusString) => { // Renamed parameter for clarity
  try {
    const res = await API.put(`/admin/courses/${courseId}/status`, { status: newStatusString }); 
    return res.data;
  } catch (error) {
    console.error(`API Error: Failed to toggle course ${courseId} status`, error);
    throw error;
  }
};

// Deletes a course
export const deleteCourse = async (id) => {
  try {
    const res = await API.delete(`/admin/courses/${id}`);
    return res.data;
  } catch (error) {
    console.error(`API Error: Failed to delete course ${id}`, error);
    throw error;
  }
};
