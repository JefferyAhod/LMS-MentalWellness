import asyncHandler from "express-async-handler";
import EducatorProfile from "../models/EducatorProfileModel.js";
import Course from "../models/CourseModel.js";

// @desc    Get educator profile
// @route   GET /api/educators/profile
export const getEducatorProfile = asyncHandler(async (req, res) => {
  const profile = await EducatorProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error("Educator profile not found");
  }
  res.json(profile);
});

// @desc    Update educator profile
// @route   PUT /api/educators/profile
export const updateEducatorProfile = asyncHandler(async (req, res) => {
  const updated = await EducatorProfile.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!updated) {
    res.status(404);
    throw new Error("Educator profile not found");
  }
  res.json(updated);
});

// @desc    Complete educator onboarding
// @route   POST /api/educators/onboarding
export const completeEducatorOnboarding = asyncHandler(async (req, res) => {
  const exists = await EducatorProfile.findOne({ user: req.user._id });
  if (exists) {
    res.status(400);
    throw new Error("Onboarding already completed");
  }
  const profile = await EducatorProfile.create({ user: req.user._id, ...req.body });
  res.status(201).json(profile);
});

// @desc    Upload sample content link
// @route   POST /api/educators/upload-sample
export const uploadSampleContent = asyncHandler(async (req, res) => {
  const { sampleLink } = req.body;

  const profile = await EducatorProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error("Educator profile not found");
  }

  profile.sampleLink = sampleLink;
  await profile.save();

  res.json({ message: "Sample content uploaded successfully" });
});

// @desc    Get educator teaching tools (Zoom, LMS, etc.)
// @route   GET /api/educators/tools
export const getTeachingTools = asyncHandler(async (req, res) => {
  const profile = await EducatorProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error("Educator profile not found");
  }

  res.json({
    platforms: profile.platforms || [],
    hasDigitalExperience: profile.hasDigitalExperience || false,
  });
});

// @desc    Create a course
// @route   POST /api/educators/courses
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({
    educator: req.user._id,
    ...req.body,
  });
  res.status(201).json(course);
});

// @desc    Update a course
// @route   PUT /api/educators/courses/:courseId
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.courseId, educator: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!course) {
    res.status(404);
    throw new Error("Course not found or not authorized");
  }
  res.json(course);
});

// @desc    Get courses created by educator
// @route   GET /api/educators/courses
export const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ educator: req.user._id });
  res.json(courses);
});

// @desc    Request approval
// @route   POST /api/educators/request-approval
export const requestApproval = asyncHandler(async (req, res) => {
  // Placeholder logic
  res.json({ message: "Your approval request has been submitted." });
});
