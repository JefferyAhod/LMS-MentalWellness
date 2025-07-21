import asyncHandler from "express-async-handler";
import EducatorProfile from "../models/EducatorProfileModel.js";
import Course from "../models/CourseModel.js";
import Enrollment from "../models/EnrollmentModel.js"; 
import Review from "../models/ReviewModel.js";
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

// @desc    Get comprehensive analytics data for the authenticated educator
// @route   GET /api/educators/analytics
export const getEducatorAnalytics = asyncHandler(async (req, res) => {
    // Verify user is authenticated and is an educator
    if (!req.user || req.user.role !== 'educator') {
        res.status(403); // Forbidden
        throw new Error('Not authorized as an educator to access analytics');
    }

    const educatorId = req.user._id;

    // Fetch the EducatorProfile document and POPULATE the 'user' field
    const educatorProfile = await EducatorProfile.findOne({ user: educatorId })
        .populate('user', 'name email role'); // Populate with relevant User fields

    if (!educatorProfile) {
        res.status(404);
        throw new Error('Educator profile not found. Please ensure the educator has completed onboarding.');
    }

    // Fetch all courses created by this educator
    const courses = await Course.find({ educator: educatorId });

    // Calculate total course views by summing viewsCount from all courses
    const totalCourseViews = courses.reduce((sum, course) => sum + (course.viewsCount || 0), 0);

    const courseIds = courses.map(course => course._id);

    // Fetch all enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
        .populate('course', 'title price category')
        .populate('student', 'name email');

    // Fetch all reviews for these courses
    const reviews = await Review.find({ course: { $in: courseIds } })
        .populate('course', 'title')
        .populate('user', 'name email');

    // Send all collected data in a single response
    res.status(200).json({
        educatorProfile: {
            ...educatorProfile.toObject(), // Spread existing profile data
            totalCourseViews: totalCourseViews // Add the new dynamic field
        },
        courses,
        enrollments,
        reviews,
        message: 'Educator analytics data fetched successfully'
    });
});