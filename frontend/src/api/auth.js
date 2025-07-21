import API from "./axios";

// Register
export const registerUser = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

// Login
export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

// Logout
export const logoutUser = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};

// Forgot Password
export const forgotPassword = async (data) => {
  const res = await API.post("/auth/forgot-password", data);
  return res.data;
};

// Reset Password
export const resetPassword = async (token, data) => {
  const res = await API.put(`/auth/reset-password/${token}`, data);
  return res.data;
};
