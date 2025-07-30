import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAICounselorResponse, getWellnessInsights } from '../controllers/aiController.js';

const aiRouter = express.Router();


// Authorize only 'student' role
aiRouter.use(protect);
aiRouter.use(authorizeRoles(['student'])); 

aiRouter.post('/insights', getWellnessInsights);

aiRouter.post('/counselor', getAICounselorResponse);

export default aiRouter;