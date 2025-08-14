// backend/controllers/courseController.js

import asyncHandler from "express-async-handler";
import Course from "../models/CourseModel.js"; // Assuming your Course model path is correct
import StudentProfile from "../models/StudentProfileModel.js";
import User from "../models/UserModel.js"; // Import User model to access activityHistory
import { logActivity } from "../utils/logActivity.js";
import { getChatCompletion } from '../services/aiService.js'; // Import the AI service for LLM calls

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
    // Log course view activity
    if (req.user) {
      await logActivity(req.user._id, "COURSE_VIEW", {
        courseId: course._id,
        courseTitle: course.title,
      });
    }

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

// @desc    Get personalized recommended courses using LLM
// @route   GET /api/courses/recommended
// @access  Private (after login)
export const getRecommendedCourses = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 3;
  const user = req.user; // Get the authenticated user object

  let recommendedCourses = []; // Initialize as empty array
  let recommendationSource = "fallback"; // Default to fallback

  // FIX: Check if user is authenticated at the very beginning
  if (!user || !user._id) {
    console.warn("Attempt to get personalized recommendations without authenticated user. Falling back to popular courses.");
    recommendedCourses = await Course.find({ status: "Published" })
      .sort({ total_enrollments: -1, ratingsAverage: -1 })
      .limit(limit);
    await logActivity(null, "RECOMMENDATION_FALLBACK_UNAUTH", "Attempted personalized recommendation without login, served popular courses.");
    return res.status(200).json(recommendedCourses);
  }

  // Outer try-catch for overall recommendation logic
  try {
    // Fetch student profile and user's activity history
    const [profile, fullUser] = await Promise.all([
      StudentProfile.findOne({ user: user._id }),
      User.findById(user._id).select('activityHistory') // Select activityHistory
    ]);

    if (profile) {
      // Inner try-catch for LLM specific logic
      try {
        let prompt = `As a personalized course recommender, analyze the following student data and suggest up to ${limit} course topics or keywords that would be highly relevant to their learning goals and interests. Focus on diverse but related areas. Prioritize subjects that align with their stated disciplines and goals, and consider their learning preferences.`;

        prompt += `\n\nStudent Profile:\n`;
        prompt += `- Major: ${profile.major || 'N/A'}\n`;
        prompt += `- University: ${profile.university || 'N/A'}\n`;
        prompt += `- Semester: ${profile.semester || 'N/A'}\n`;
        prompt += `- Study Style: ${profile.studyStyle || 'N/A'}\n`;
        prompt += `- Study Time Preference: ${profile.studyTime || 'N/A'}\n`;
        prompt += `- Learning Styles: ${profile.learningStyles && profile.learningStyles.length > 0 ? profile.learningStyles.join(', ') : 'N/A'}\n`;
        prompt += `- Goals: ${profile.goals && profile.goals.length > 0 ? profile.goals.join(', ') : 'N/A'}\n`;
        prompt += `- Disciplines/Interests: ${profile.disciplines && profile.disciplines.length > 0 ? profile.disciplines.join(', ') : 'N/A'}\n`;

        if (fullUser && fullUser.activityHistory && fullUser.activityHistory.length > 0) {
          // Limit activity history to recent relevant entries
          const recentActivity = fullUser.activityHistory
            .filter(activity => activity.action === "COURSE_VIEW" || activity.action === "Enroll")
            .sort((a, b) => b.date - a.date)
            .slice(0, 5) // Last 5 relevant activities
            .map(activity => `${activity.action}: ${activity.description}`);
          
          if (recentActivity.length > 0) {
            prompt += `\nRecent Activity History (relevant actions):\n`;
            prompt += recentActivity.map(item => `- ${item}`).join('\n');
          }
        }

        prompt += `\n\nProvide the response as a JSON object with a single key "suggestions" which is an array of strings. Example: {"suggestions": ["Web Development", "UI/UX Design", "Business Analytics"]}`;

        console.log("Sending prompt to LLM:", prompt); // For debugging LLM prompt

        // Call LLM API for recommendations
        const llmResponse = await getChatCompletion(
          [{ role: "user", content: prompt }],
          0.7, // temperature
          1,   // top_p
          undefined, // model (use default)
          { type: "json_object" } // Request JSON object output
        );

        console.log("LLM raw response:", llmResponse); // For debugging LLM raw response

        let llmSuggestions = [];
        try {
          const parsedResponse = JSON.parse(llmResponse);
          if (parsedResponse && Array.isArray(parsedResponse.suggestions)) {
            llmSuggestions = parsedResponse.suggestions;
          }
        } catch (parseError) {
          console.error("Failed to parse LLM response as JSON:", parseError);
          // LLM response malformed, will fall back
        }

        if (llmSuggestions.length > 0) {
          // Build course query using LLM suggestions
          const llmQuery = {
            status: "Published",
            $or: llmSuggestions.map(suggestion => ({
              $or: [
                { category: { $regex: suggestion, $options: "i" } },
                { subject: { $regex: suggestion, $options: "i" } },
                { tags: { $regex: suggestion, $options: "i" } },
                { title: { $regex: suggestion, $options: "i" } }
              ]
            }))
          };
          
          // Ensure $or array is not empty to avoid invalid queries
          if (llmQuery.$or.length === 0) {
            delete llmQuery.$or; // Remove if no suggestions
          }

          const coursesFromLLM = await Course.find(llmQuery)
            .sort({ total_enrollments: -1, ratingsAverage: -1 })
            .limit(limit);

          if (coursesFromLLM.length > 0) {
            recommendedCourses = coursesFromLLM;
            recommendationSource = "llm_personalized";
            await logActivity(user._id, "RECOMMENDATION_LLM", `Personalized courses via LLM: ${llmSuggestions.join(', ')}`);
          } else {
            console.log("LLM suggestions didn't yield courses, will fall back.");
          }
        } else {
          console.log("LLM returned no valid suggestions, will fall back.");
        }
      } catch (llmSpecificError) {
        console.error("Error during LLM call or processing:", llmSpecificError);
      }
    } else {
      console.log("No student profile found for user, will fall back.");
    }
  } catch (overallError) {
    console.error("Overall error in getRecommendedCourses:", overallError);
  } finally {
    // This finally block ensures a response is always sent, and falls back if needed
    if (!recommendedCourses || recommendedCourses.length === 0) {
      recommendedCourses = await Course.find({ status: "Published" })
        .sort({ total_enrollments: -1, ratingsAverage: -1 })
        .limit(limit);
      
      await logActivity(user?._id || null, "RECOMMENDATION_FALLBACK", "User recommended popular courses (LLM failed, no profile, or other error)");
    }
    // Always send a response here
    res.status(200).json(recommendedCourses);
  }
});
