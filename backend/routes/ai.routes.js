import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { buildQuizAssessment, createCourseThumbnailIdea, generateCourseOutline, getAICounselorResponse, getWellnessInsights, writeCourseDescription } from '../controllers/aiController.js';

const aiRouter = express.Router();


// Authorize only 'student' role
aiRouter.post('/insights', protect, authorizeRoles(['student']), getWellnessInsights);

aiRouter.post('/counselor', protect, authorizeRoles(['student']), getAICounselorResponse);

// Authorize only 'educator' role
aiRouter.use(protect);
aiRouter.use(authorizeRoles(['educator'])); 

aiRouter.post('/generate-course-outline', generateCourseOutline);

aiRouter.post('/write-course-description', writeCourseDescription);

aiRouter.post('/create-course-thumbnail-idea', createCourseThumbnailIdea);

aiRouter.post('/build-quiz-assessment', buildQuizAssessment);

export default aiRouter;