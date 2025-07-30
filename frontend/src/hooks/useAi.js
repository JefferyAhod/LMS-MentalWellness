import { useState, useEffect, useCallback } from 'react';
import { getWellnessInsights, getAICounselorResponse } from '../api/ai.js'; // Path adjusted for new structure

/**
 * Custom hook to fetch and manage AI-generated wellness insights.
 *
 * @param {object} moodData - An object containing the mood data needed for insights.
 * Expected properties: { moodEntries, todaysMood, weeklyAverage, userId, userNotes }
 * @param {boolean} triggerFetch - A boolean to control when to trigger the fetch (e.g., when data is ready).
 * @returns {object} An object containing:
 * - insight: The AI-generated insight string.
 * - isLoading: Boolean indicating if the insight is currently being loaded.
 * - error: Any error that occurred during fetching.
 * - refetchInsights: A function to manually re-fetch insights.
 */
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