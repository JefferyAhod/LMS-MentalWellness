// backend/controllers/wellnessAiController.js
import asyncHandler from 'express-async-handler';
// Import the generic chat completion function from your AI service
import { getChatCompletion } from '../services/aiService.js';
import MoodEntry from '../models/MoodEntryModel.js';

// Helper function to calculate weekly average mood score on the backend
const calculateWeeklyAverageMoodScore = (entries) => {
  if (!entries || entries.length === 0) return 0;

  const moodScores = {
      'very_sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very_happy': 5
  };

  const now = new Date();
  const oneWeekAgo = new Date(now.setDate(now.getDate() - 7)); // Date 7 days ago

  const recentMoods = entries.filter(entry => new Date(entry.date) >= oneWeekAgo);

  if (recentMoods.length === 0) return 0;

  const totalScore = recentMoods.reduce((sum, entry) => sum + (moodScores[entry.mood] || 0), 0);
  return (totalScore / recentMoods.length).toFixed(1);
};

// @desc    Get AI-generated wellness insights
// @route   POST /api/ai/insights
// @access  Private (requires authentication)
export const getWellnessInsights = asyncHandler(async (req, res) => {
  // Assuming req.user is populated by your authentication middleware (e.g., `protect` middleware)
  const userId = req.user._id; // Get the authenticated user's ID

  // Fetch all mood entries for the authenticated user from the database
  // Sort by date descending to get recent entries easily
  const allMoodEntries = await MoodEntry.find({ user: userId }).sort({ date: -1 });

  // Determine today's mood from the fetched data
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to start of day
  const todaysMood = allMoodEntries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0); // Normalize entry date
    return entryDate.getTime() === today.getTime();
  });

  // Calculate weekly average mood score from fetched data
  const weeklyAverage = calculateWeeklyAverageMoodScore(allMoodEntries);

  // Use a subset of recent mood entries for the prompt if there are many,
  // to keep the prompt length manageable and relevant to recent trends.
  // For example, use the last 10 entries for detailed context.
  const recentMoodEntriesForPrompt = allMoodEntries.slice(0, 10);

  // Construct a comprehensive prompt for the AI model as a system message
  const systemPromptContent = `You are an empathetic and insightful AI assistant specializing in mental wellness.
  Analyze the following mood data for user ID ${userId}:
  Today's Mood: ${todaysMood ? `${todaysMood.mood} (Notes: ${todaysMood.notes || 'N/A'})` : 'Not set'}
  Weekly Average Mood Score: ${weeklyAverage}
  Recent Mood History (${recentMoodEntriesForPrompt.length} entries):
  ${recentMoodEntriesForPrompt.map(entry => `- Date: ${new Date(entry.date).toLocaleDateString()}, Mood: ${entry.mood}, Notes: ${entry.notes || 'N/A'}`).join('\n')}

  Provide a concise, empathetic wellness insight or observation based on this data. Highlight any notable trends and offer a general, encouraging message. Keep it under 200 words.`;

  const messages = [
    { role: "system", content: systemPromptContent },
  ];

  // Call the AI service to get the completion
  const insight = await getChatCompletion(messages, 0.7);

  res.json({ success: true, insight });
});



// @desc    Get AI counselor response
// @route   POST /api/ai/counselor
// @access  Private (should be)
export const getAICounselorResponse = asyncHandler(async (req, res) => {
  // chatHistory should be an array of messages compatible with the AI API's format:
  // [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
  const { chatHistory } = req.body;

  // Add a system instruction to guide the AI's behavior
  const systemInstruction = {
    role: "system",
    content: "You are a supportive, empathetic, and non-judgmental AI wellness counselor. Your purpose is to listen, offer gentle guidance, encourage self-reflection, and provide general coping strategies. You should never diagnose, prescribe, or give medical advice. Keep responses concise and focused on well-being. Acknowledge the user's last message before responding."
  };

  // Combine system instruction with the provided chat history
  const messages = [systemInstruction, ...chatHistory];

  // Call the AI service to get the completion
  // We use a temperature of 0.8 for a slightly more conversational feel
  const aiResponse = await getChatCompletion(messages, 0.8);

  res.json({ success: true, response: aiResponse });
});