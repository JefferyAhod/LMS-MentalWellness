import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import Course from "../models/CourseModel.js";

// GET /api/admin/profile
export const getAdminProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// PUT /api/admin/profile
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user._id);
  if (!admin) throw new Error("Admin not found");

  admin.name = req.body.name || admin.name;
  admin.email = req.body.email || admin.email;
  const updatedAdmin = await admin.save();
  res.json(updatedAdmin);
});

// GET /api/admin/dashboard-stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const students = await User.countDocuments({ role: "student" });
  const educators = await User.countDocuments({ role: "educator" });
  const pendingEducators = await User.countDocuments({ role: "educator", status: "pending" });
  const courses = await Course.countDocuments();

  res.json({
    totalUsers,
    students,
    educators,
    pendingEducators,
    totalCourses: courses,
  });
});

// POST /api/admin/approve-educator/:id
export const approveEducator = asyncHandler(async (req, res) => {
  const educator = await User.findById(req.params.id);
  if (!educator || educator.role !== "educator") {
    res.status(404);
    throw new Error("Educator not found");
  }
  educator.status = "approved";
  await educator.save();
  res.json({ message: "Educator approved successfully" });
});

// POST /api/admin/reject-educator/:id
export const rejectEducator = asyncHandler(async (req, res) => {
  const educator = await User.findById(req.params.id);
  if (!educator || educator.role !== "educator") {
    res.status(404);
    throw new Error("Educator not found");
  }
  educator.status = "rejected";
  await educator.save();
  res.json({ message: "Educator rejected" });
});

// GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// GET /api/admin/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ message: "User deleted successfully" });
});

// GET /api/admin/courses
export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("educator", "name email");
  res.json(courses);
});

// DELETE /api/admin/courses/:id
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  res.json({ message: "Course deleted successfully" });
});
