import express from 'express';
import {
  createOrUpdateMoodEntry,
  getMoodEntries,
  getTodaysMoodEntry,
  deleteMoodEntry
} from '../controllers/moodEntryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const moodEntryRouter = express.Router();


// Authorize only 'student' role
moodEntryRouter.use(protect);
moodEntryRouter.use(authorizeRoles(['student'])); 

// @route   POST /api/moods
// @desc    Create or update today's mood entry
// @access  Private (Student)
moodEntryRouter.route('/').post(createOrUpdateMoodEntry);

// @route   GET /api/moods
// @desc    Get all mood entries for the logged-in user
// @access  Private (Student)
moodEntryRouter.route('/').get(getMoodEntries);

// @route   GET /api/moods/today
// @desc    Get today's mood entry for the logged-in user
// @access  Private (Student)
moodEntryRouter.route('/today').get(getTodaysMoodEntry);

// @route   DELETE /api/moods/:id
// @desc    Delete a specific mood entry by ID
// @access  Private (Owner only)
moodEntryRouter.route('/:id').delete(deleteMoodEntry);

export default moodEntryRouter;
