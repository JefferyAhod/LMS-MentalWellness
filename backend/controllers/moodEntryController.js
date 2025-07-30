import asyncHandler from 'express-async-handler';
import MoodEntry from '../models/MoodEntryModel.js';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Create or update today's mood entry
// @route   POST /api/moods
// @access  Private
export const createOrUpdateMoodEntry = asyncHandler(async (req, res) => {
  const { mood, notes } = req.body;
  const userId = req.user._id; // User ID from protect middleware
  const todayDate = getTodayDateString();

  if (!mood) {
    res.status(400);
    throw new Error('Mood is required.');
  }

  // Check if an entry for today already exists for this user
  let moodEntry = await MoodEntry.findOne({ user: userId, date: todayDate });

  if (moodEntry) {
    // If entry exists, update it
    moodEntry.mood = mood;
    moodEntry.notes = notes || moodEntry.notes; // Only update notes if provided
    await moodEntry.save();
    res.status(200).json(moodEntry); 
  } else {
    // If no entry for today, create a new one
    moodEntry = await MoodEntry.create({
      user: userId,
      mood,
      notes,
      date: todayDate,
    });
    res.status(201).json(moodEntry); // 201 Created for new entry
  }
});

// @desc    Get all mood entries for the logged-in user
// @route   GET /api/moods
// @access  Private
export const getMoodEntries = asyncHandler(async (req, res) => {
  const moodEntries = await MoodEntry.find({ user: req.user._id }).sort({ date: -1 }); // Sort by date descending
  res.status(200).json(moodEntries);
});

// @desc    Get today's mood entry for the logged-in user
// @route   GET /api/moods/today
// @access  Private
export const getTodaysMoodEntry = asyncHandler(async (req, res) => {
  const todayDate = getTodayDateString();
  const moodEntry = await MoodEntry.findOne({ user: req.user._id, date: todayDate });

  if (moodEntry) {
    res.status(200).json(moodEntry);
  } else {
    // Return a null or empty object if no entry for today, indicating no mood tracked yet for the day
    res.status(200).json(null);
  }
});

// @desc    Delete a mood entry
// @route   DELETE /api/moods/:id
// @access  Private (Owner only)
export const deleteMoodEntry = asyncHandler(async (req, res) => {
  const moodEntry = await MoodEntry.findById(req.params.id);

  if (!moodEntry) {
    res.status(404);
    throw new Error('Mood entry not found');
  }

  // Ensure the logged-in user owns this mood entry
  if (moodEntry.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this mood entry');
  }

  await MoodEntry.deleteOne({ _id: req.params.id }); 

  res.status(200).json({ message: 'Mood entry removed' });
});
