import { useState, useEffect, useCallback } from 'react';
import { getWellnessInsights, getAICounselorResponse, generateCourseOutline, writeCourseDescription, buildQuizAssessment, createCourseThumbnailImage } from '../api/ai.js'; 

export const useWellnessInsights = (moodData, triggerFetch = false) => {
  const [insight, setInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsight = useCallback(async () => {
    // Only fetch if essential data (userId and moodEntries) is present
    if (!moodData || !moodData.userId || !Array.isArray(moodData.moodEntries)) {
      console.warn("useWellnessInsights: Essential mood data missing for AI insights. Skipping fetch.");
      // You might want to set a specific error or message here if this is a critical case
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // --- CRITICAL FIX: Pass moodData.userId directly to the API function ---
      const aiInsight = await getWellnessInsights(moodData.userId); // Pass the userId directly
      // --- END CRITICAL FIX ---
      setInsight(aiInsight);
    } catch (err) {
      console.error("Failed to fetch wellness insights:", err);
      setError("Failed to load wellness insights. Please try again later.");
      setInsight(null);
    } finally {
      setIsLoading(false);
    }
  }, [moodData]);

  useEffect(() => {
    if (triggerFetch) {
      fetchInsight();
    }
  }, [triggerFetch, fetchInsight]);

  return { insight, isLoading, error, refetchInsights: fetchInsight };
};


export const useAICounselorChat = () => {
  const [chatHistory, setChatHistory] = useState([
    // Add timestamp to initial message
    { role: 'assistant', content: "Hello! I'm here to listen and support you on your wellness journey. What's on your mind today?", timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    setError(null);
    // Add timestamp to user's message
    const newUserMessage = { role: 'user', content: userMessage, timestamp: new Date() };

    setChatHistory((prevHistory) => [...prevHistory, newUserMessage]);
    setIsTyping(true);

    try {
      const aiResponseContent = await getAICounselorResponse([...chatHistory, newUserMessage]);

      // Add timestamp to AI's response
      const newAssistantMessage = { role: 'assistant', content: aiResponseContent, timestamp: new Date() };

      setChatHistory((prevHistory) => [...prevHistory, newAssistantMessage]);

    } catch (err) {
      console.error("Error sending message to AI Counselor:", err);
      setError("Failed to get a response from the counselor. Please try again.");
      // Filter based on unique timestamp if possible, otherwise rely on content/role
      setChatHistory((prevHistory) => prevHistory.filter(msg => !(msg.role === 'user' && msg.content === userMessage && msg.timestamp?.getTime() === newUserMessage.timestamp?.getTime())));
    } finally {
      setIsTyping(false);
    }
  }, [chatHistory]);

  const clearChat = useCallback(() => {
    setChatHistory([
      // Add timestamp to initial message when clearing
      { role: 'assistant', content: "Hello! I'm here to listen and support you on your wellness journey. What's on your mind today?", timestamp: new Date() }
    ]);
    setError(null);
  }, []);

  return { chatHistory, isTyping, error, sendMessage, clearChat };
};

// --- Course Outline Generator Hook (For Educators) ---
export const useCourseOutlineGenerator = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState('');
  const [audience, setAudience] = useState('');
  const [styleTone, setStyleTone] = useState('Informative');
  const [additionalContext, setAdditionalContext] = useState('');
  const [outline, setOutline] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateOutline = useCallback(async () => {
    if (!topic.trim()) {
      setError('Topic/Subject is required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setOutline(null);

    try {
      const generatedOutline = await generateCourseOutline({
        topic,
        difficulty,
        duration: duration ? parseInt(duration) : undefined,
        audience,
        styleTone,
        additionalContext,
      });
      setOutline(generatedOutline);
    } catch (err) {
      console.error('Failed to generate course outline:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate course outline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, difficulty, duration, audience, styleTone, additionalContext]);

  return {
    topic, setTopic,
    difficulty, setDifficulty,
    duration, setDuration,
    audience, setAudience,
    styleTone, setStyleTone,
    additionalContext, setAdditionalContext,
    outline, isLoading, error, generateOutline
  };
};

// --- Course Description Writer Hook (For Educators) ---
export const useCourseDescriptionWriter = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState('');
  const [audience, setAudience] = useState('');
  const [styleTone, setStyleTone] = useState('Informative');
  const [additionalContext, setAdditionalContext] = useState('');
  const [description, setDescription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const writeDescription = useCallback(async () => {
    if (!topic.trim()) {
      setError('Topic/Subject is required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setDescription(null);

    try {
      const generatedDescription = await writeCourseDescription({
        topic,
        difficulty,
        duration: duration ? parseInt(duration) : undefined,
        audience,
        styleTone,
        additionalContext,
      });
      setDescription(generatedDescription);
    } catch (err) {
      console.error('Failed to write course description:', err);
      setError(err.response?.data?.message || err.message || 'Failed to write course description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, difficulty, duration, audience, styleTone, additionalContext]);

  return {
    topic, setTopic,
    difficulty, setDifficulty,
    duration, setDuration,
    audience, setAudience,
    styleTone, setStyleTone,
    additionalContext, setAdditionalContext,
    description, isLoading, error, writeDescription
  };
};

// --- Course Thumbnail Idea Creator Hook (For Educators) ---
export const useCourseThumbnailIdeaCreator = () => {
  const [topic, setTopic] = useState('');
  const [styleTone, setStyleTone] = useState('Creative');
  const [additionalContext, setAdditionalContext] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const createThumbnailIdea = useCallback(async () => {
    if (!topic.trim()) {
      setError('Course Topic is required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setThumbnailImage(null); // Clear previous image

    try {
      // It now returns a base64 image URL (e.g., "data:image/png;base64,...")
      const generatedImage = await createCourseThumbnailImage({
        topic,
        styleTone,
        additionalContext,
      });
      // Set the base64 image URL to the state
      setThumbnailImage(generatedImage); 
    } catch (err) {
      console.error('Failed to create thumbnail image:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create thumbnail image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, styleTone, additionalContext]);

  return {
    topic, setTopic,
    styleTone, setStyleTone,
    additionalContext, setAdditionalContext,
    thumbnailImage, isLoading, error, createThumbnailIdea
  };
};
// --- Quiz & Assessment Builder Hook (For Educators) ---
export const useQuizAssessmentBuilder = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [numQuestions, setNumQuestions] = useState('');
  const [questionTypes, setQuestionTypes] = useState([]); // e.g., ['multiple-choice', 'true-false']
  const [additionalContext, setAdditionalContext] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const buildQuiz = useCallback(async () => {
    if (!topic.trim() || !numQuestions) {
      setError('Topic/Subject and Number of Questions are required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuiz(null);

    try {
      const generatedQuiz = await buildQuizAssessment({
        topic,
        difficulty,
        numQuestions: parseInt(numQuestions), // Ensure number type
        questionTypes,
        additionalContext,
      });
      setQuiz(generatedQuiz);
    } catch (err) {
      console.error('Failed to build quiz/assessment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to build quiz/assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, difficulty, numQuestions, questionTypes, additionalContext]);

  // Helper for checkbox/multi-select question types
  const handleQuestionTypeChange = useCallback((type) => {
    setQuestionTypes((prevTypes) =>
      prevTypes.includes(type)
        ? prevTypes.filter((t) => t !== type)
        : [...prevTypes, type]
    );
  }, []);

  return {
    topic, setTopic,
    difficulty, setDifficulty,
    numQuestions, setNumQuestions,
    questionTypes, handleQuestionTypeChange,
    additionalContext, setAdditionalContext,
    quiz, isLoading, error, buildQuiz
  };
};