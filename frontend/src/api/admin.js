// src/api/admin.js
import API from "./axios";

export const getAdminProfile = async () => {
  const res = await API.get("/admin/profile");
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await API.get("/admin/dashboard");
  return res.data;
};

export const approveEducator = async (educatorId) => {
  const res = await API.put(`/admin/educators/${educatorId}/approve`);
  return res.data;
};

export const rejectEducator = async (educatorId) => {
  const res = await API.put(`/admin/educators/${educatorId}/reject`);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await API.get("/admin/users");
  return res.data;
};

export const getUserById = async (id) => {
  const res = await API.get(`/admin/users/${id}`);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await API.delete(`/admin/users/${id}`);
  return res.data;
};

export const getAllCourses = async () => {
  const res = await API.get("/admin/courses");
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await API.delete(`/admin/courses/${id}`);
  return res.data;
};
