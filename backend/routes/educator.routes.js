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
  getEducatorAnalytics,
} from "../controllers/educator.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import multer from 'multer';
const educatorRouter = express.Router();
const upload = multer();
// All educator routes are protected and must have role = 'educator'
educatorRouter.use(protect, authorizeRoles(["educator"]));

// Educator profile
educatorRouter.get("/profile", getEducatorProfile);
educatorRouter.put("/profile", updateEducatorProfile);

// Onboarding
educatorRouter.post("/onboarding", upload.none(), completeEducatorOnboarding);

// Sample content upload
educatorRouter.post("/upload-sample", uploadSampleContent);

// Teaching tools
educatorRouter.get("/tools", getTeachingTools);

// Courses
educatorRouter.post("/courses", createCourse);
educatorRouter.put("/courses/:courseId", updateCourse);
educatorRouter.get("/my-courses", getMyCourses);

// Approval request (optional)
educatorRouter.post("/request-approval", requestApproval);

educatorRouter.get('/analytics', getEducatorAnalytics);

export default educatorRouter;
