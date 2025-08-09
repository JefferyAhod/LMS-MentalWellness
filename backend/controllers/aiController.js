// backend/controllers/wellnessAiController.js
import asyncHandler from 'express-async-handler';
// Import the generic chat completion function from your AI service
import { getChatCompletion, generateImageWithImagen } from '../services/aiService.js';
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

/**
 * @desc    Generates a course thumbnail image using Imagen 4.0 based on a textual prompt.
 * @route   POST /api/ai/create-course-thumbnail-image
 * @access  Private (e.g., authenticated educator)
 */
export const createCourseThumbnailImage = async (req, res) => {
    const { topic, styleTone, additionalContext } = req.body;

    if (!topic) {
        return res.status(400).json({ message: 'Course Topic is required to generate a thumbnail image.' });
    }

    // Construct the detailed prompt for the image generation model
    // This prompt will be sent to the generateImageWithImagen service
    let imagePrompt = `Generate a visually appealing course thumbnail for the topic: "${topic}".`;
    if (styleTone) {
        imagePrompt += ` The style/tone should be ${styleTone}.`;
    }
    if (additionalContext) {
        imagePrompt += ` Key elements to include: ${additionalContext}.`;
    }
    imagePrompt += ` Ensure it's suitable for a digital learning platform, with clear, concise visuals.`;

    try {
        // Call the new service function to generate the image
        const imageUrl = await generateImageWithImagen(imagePrompt);

        // Send the base64-encoded image URL back to the frontend
        res.status(200).json({ thumbnailImage: imageUrl });

    } catch (error) {
        console.error('Error in createCourseThumbnailImage controller:', error);
        res.status(500).json({ message: 'Failed to generate thumbnail image.', error: error.message });
    }
};

// @desc    Build a quiz or assessment
// @route   POST /api/ai/build-quiz-assessment
// @access  Private (or public)
export const buildQuizAssessment = asyncHandler(async (req, res) => {
    const { topic, difficulty, numQuestions, questionTypes, additionalContext } = req.body;

    if (!topic || !numQuestions) {
        return res.status(400).json({ error: 'Topic/Subject and Number of Questions are required.' });
    }

    // Construct a detailed prompt for the AI, now focusing on the content,
    // as the format will be enforced by response_format.
    let prompt = `Generate a quiz on the topic of "${topic}".\n`;
    prompt += `Difficulty: ${difficulty}.\n`;
    prompt += `Number of questions: ${numQuestions}.\n`;

    if (questionTypes && questionTypes.length > 0) {
        prompt += `Question types: ${questionTypes.join(', ').replace(/-/g, ' ')}.\n`;
    } else {
        prompt += `Question types: multiple-choice, true-false, short-answer (mix them if possible).\n`;
    }

    if (additionalContext) {
        prompt += `Additional context/specific concepts to cover: ${additionalContext}.\n`;
    }

    // Explicitly instruct the AI to provide output in a specific JSON format
    prompt += `\nProvide the quiz as a JSON object with the following structure. Ensure all top-level keys (multiple_choice, true_false, short_answer) are present, even if their arrays are empty. For multiple choice, 'correct_answer' should be the 0-indexed number of the correct option. For true/false, 'correct_answer' should be a boolean.
{
  "multiple_choice": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_answer": "number",
      "explanation": "string"
    }
  ],
  "true_false": [
    {
      "question": "string",
      "correct_answer": "boolean",
      "explanation": "string"
    }
  ],
  "short_answer": [
    {
      "question": "string",
      "sample_answer": "string",
      "grading_criteria": ["string", "string"]
    }
  ]
}`;

    try {
        // Call getChatCompletion with the new responseFormat parameter
        const jsonStringQuiz = await getChatCompletion(
            [{ role: "user", content: prompt }],
            0.7, // temperature
            1,   // top_p
            undefined, // model (use default)
            { type: "json_object" } // Request JSON object output
        );

        // Attempt to parse the JSON string received from the AI
        const parsedQuiz = JSON.parse(jsonStringQuiz);
        res.json({ success: true, quiz: parsedQuiz });
    } catch (error) {
        console.error('Error building quiz/assessment or parsing JSON:', error);
        res.status(500).json({ error: 'Failed to build quiz/assessment. The AI might have returned an invalid JSON format or encountered an internal error. Please try again.' });
    }
});
