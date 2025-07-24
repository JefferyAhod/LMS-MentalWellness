// backend/controllers/courseController.js

import asyncHandler from "express-async-handler";
import Course from "../models/CourseModel.js"; // Assuming your Course model path is correct

// @desc    Get all published courses with optional filtering and search
// @route   GET /api/courses
// @access  Public (or Private if you want only logged-in users to browse)
export const getAllCourses = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;

  const query = {
    status: "Published", // <--- CORRECTED: Filter by status 'Published'
  };

  // Filter by category
  if (category && category !== "all") {
    query.category = category;
  }

  // Search by title or instructor name
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } }, // Case-insensitive search
      { instructor_name: { $regex: search, $options: "i" } },
    ];
  }

  const pageSize = parseInt(limit, 10);
  const skip = (parseInt(page, 10) - 1) * pageSize;

  // Get total count for pagination metadata
  const totalCourses = await Course.countDocuments(query);

  const courses = await Course.find(query)
    .sort({ created_date: -1 }) // Sort by most recent first
    .limit(pageSize)
    .skip(skip);

  res.status(200).json({
    courses,
    page: parseInt(page, 10),
    pages: Math.ceil(totalCourses / pageSize),
    totalCourses,
  });
});

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (course) {
    res.json(course);
  } else {
    res.status(404);
    throw new Error("Course not found");
  }
});

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
export const getFeaturedCourses = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 3; // Default to 3 featured courses

  const featuredCourses = await Course.find({
    status: "Published",
    is_featured: true,
  })
    .sort({ created_date: -1 }) // Or by a 'featured_order' field if you have one
    .limit(limit);

  res.status(200).json(featuredCourses);
});

// @desc    Get recommended courses (simple implementation for now)
// @route   GET /api/courses/recommended
// @access  Public (can be private later for personalized recommendations)
export const getRecommendedCourses = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 3;
  const recommendedCourses = await Course.find({
    status: "Published",
  })
    // CHANGED: Use ratingsAverage to match your schema
    .sort({ total_enrollments: -1, ratingsAverage: -1 })
    .limit(limit);
  res.status(200).json(recommendedCourses);
});