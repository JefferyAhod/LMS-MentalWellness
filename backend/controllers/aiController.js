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

// @desc    Generate a course outline
// @route   POST /api/ai/generate-course-outline
// @access  Private (or public, depending on your app's design)
export const generateCourseOutline = asyncHandler(async (req, res) => {
    const { topic, difficulty, duration, audience, styleTone, additionalContext } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic/Subject is required.' });
    }

    let prompt = `Generate a comprehensive course outline.`;
    prompt += `\nTopic/Subject: ${topic}.`;
    if (difficulty) prompt += `\nDifficulty Level: ${difficulty}.`;
    if (duration) prompt += `\nCourse Duration: ${duration} hours.`;
    if (audience) prompt += `\nTarget Audience: ${audience}.`;
    if (styleTone) prompt += `\nStyle/Tone: ${styleTone}.`;
    if (additionalContext) prompt += `\nAdditional Context: ${additionalContext}.`;
    prompt += `\n\nProvide the outline as a JSON array of chapters, where each chapter is an object with a "title" and an array of "lessons". Ensure the output is valid JSON. Example: [{"title": "Introduction", "lessons": ["Welcome", "Course Goals"]}]`;

    const messages = [{ role: "user", content: prompt }];

    try {
        const jsonStringOutline = await getChatCompletion(messages, 0.7); // Use a moderate temperature

        // Attempt to parse the JSON string received from the AI
        const parsedOutline = JSON.parse(jsonStringOutline);
        res.json({ success: true, outline: parsedOutline });
    } catch (error) {
        console.error('Error generating course outline or parsing JSON:', error);
        res.status(500).json({ error: 'Failed to generate course outline. The AI might have returned an invalid JSON format. Please try again.' });
    }
});

// @desc    Write a course description
// @route   POST /api/ai/write-course-description
// @access  Private (or public)
export const writeCourseDescription = asyncHandler(async (req, res) => {
    const { topic, difficulty, duration, audience, styleTone, additionalContext } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic/Subject is required.' });
    }

    let prompt = `Write a compelling and informative course description.`;
    prompt += `\nTopic/Subject: ${topic}.`;
    if (difficulty) prompt += `\nDifficulty Level: ${difficulty}.`;
    if (duration) prompt += `\nCourse Duration: ${duration} hours.`;
    if (audience) prompt += `\nTarget Audience: ${audience}.`;
    if (styleTone) prompt += `\nStyle/Tone: ${styleTone}.`;
    if (additionalContext) prompt += `\nAdditional Context: ${additionalContext}.`;
    prompt += `\n\nKeep the description concise and engaging, suitable for a course catalog.`;

    const messages = [{ role: "user", content: prompt }];

    try {
        const description = await getChatCompletion(messages, 0.8); // Higher temperature for more creativity
        res.json({ success: true, description });
    } catch (error) {
        console.error('Error writing course description:', error);
        res.status(500).json({ error: 'Failed to write course description. Please try again.' });
    }
});

// @desc    Create a course thumbnail idea (textual description)
// @route   POST /api/ai/create-course-thumbnail-idea
// @access  Private (or public)
export const createCourseThumbnailIdea = asyncHandler(async (req, res) => {
    const { topic, styleTone, additionalContext } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic/Subject is required.' });
    }

    let prompt = `Generate a creative and eye-catching idea for a course thumbnail.`;
    prompt += `\nCourse Topic: ${topic}.`;
    if (styleTone) prompt += `\nDesired Style/Tone for thumbnail: ${styleTone}.`;
    if (additionalContext) prompt += `\nAdditional Context/Key elements to include: ${additionalContext}.`;
    prompt += `\n\nDescribe the visual concept, colors, and any text or icons. Be descriptive but concise.`;

    const messages = [{ role: "user", content: prompt }];

    try {
        const thumbnailIdea = await getChatCompletion(messages, 0.9); // Even higher temperature for creative ideas
        res.json({ success: true, thumbnailIdea });
    } catch (error) {
        console.error('Error generating thumbnail idea:', error);
        res.status(500).json({ error: 'Failed to generate thumbnail idea. Please try again.' });
    }
});

// @desc    Build a quiz or assessment
// @route   POST /api/ai/build-quiz-assessment
// @access  Private (or public)
export const buildQuizAssessment = asyncHandler(async (req, res) => {
    const { topic, difficulty, numQuestions, questionTypes, additionalContext } = req.body;

    if (!topic || !numQuestions) {
        return res.status(400).json({ error: 'Topic/Subject and Number of Questions are required.' });
    }

    let prompt = `Create a quiz or assessment.`;
    prompt += `\nTopic: ${topic}.`;
    prompt += `\nNumber of Questions: ${numQuestions}.`;
    if (difficulty) prompt += `\nDifficulty Level: ${difficulty}.`;
    if (questionTypes && questionTypes.length > 0) prompt += `\nQuestion Types: ${questionTypes.join(', ')}.`;
    if (additionalContext) prompt += `\nAdditional Context: ${additionalContext}.`;
    prompt += `\n\nProvide the quiz as a JSON array of questions, where each question is an object with "questionText", "type" (e.g., "multiple-choice", "true-false"), "options" (if multiple-choice, an array of strings), and "correctAnswer" (string or array of strings for multiple correct). Ensure the output is valid JSON. Example: [{"questionText": "What is 2+2?", "type": "multiple-choice", "options": ["3", "4", "5"], "correctAnswer": "4"}]`;

    const messages = [{ role: "user", content: prompt }];

    try {
        const jsonStringQuiz = await getChatCompletion(messages, 0.7); // Moderate temperature for factual questions

        // Attempt to parse the JSON string received from the AI
        const parsedQuiz = JSON.parse(jsonStringQuiz);
        res.json({ success: true, quiz: parsedQuiz });
    } catch (error) {
        console.error('Error building quiz/assessment or parsing JSON:', error);
        res.status(500).json({ error: 'Failed to build quiz/assessment. The AI might have returned an invalid JSON format. Please try again.' });
    }
});
