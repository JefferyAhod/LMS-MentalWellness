import express from "express";
import {
  getEducatorProfile,
  updateEducatorProfile,
  completeEducatorOnboarding,
  uploadSampleContent,
  getTeachingTools,
  createCourse,
  updateCourse,
  getMyCourses,
  requestApproval,
} from "../controllers/educator.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const educatorRouter = express.Router();

// All educator routes are protected and must have role = 'educator'
educatorRouter.use(protect, authorizeRoles(["educator"]));

// Educator profile
educatorRouter.get("/profile", getEducatorProfile);
educatorRouter.put("/profile", updateEducatorProfile);

// Onboarding
educatorRouter.post("/onboarding", completeEducatorOnboarding);

// Sample content upload
educatorRouter.post("/upload-sample", uploadSampleContent);

// Teaching tools (e.g. Zoom, LMS, etc.)
educatorRouter.get("/tools", getTeachingTools);

// Courses
educatorRouter.post("/courses", createCourse);
educatorRouter.put("/courses/:courseId", updateCourse);
educatorRouter.get("/courses", getMyCourses);

// Approval request (optional)
educatorRouter.post("/request-approval", requestApproval);

export default educatorRouter;
