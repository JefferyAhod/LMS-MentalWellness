import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext'; 
import {
  createOrUpdateMoodEntry,
  getMoodEntries,
  getTodaysMoodEntry,
  deleteMoodEntry,
  // getWellnessInsights, // For future AI integration
  // getAICounselorResponse // For future AI integration
} from '@/api/moods';

export const useMoodTracker = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [moodEntries, setMoodEntries] = useState([]);
  const [todaysMood, setTodaysMood] = useState(null); // null if no entry, object if found
  const [isLoadingMoods, setIsLoadingMoods] = useState(true);
  const [moodError, setMoodError] = useState(null);
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetches all past mood entries and today's entry
const fetchMoodData = useCallback(async () => {
  setIsLoadingMoods(true);
  setMoodError(null);
  try {
    const [allEntries, todayEntry] = await Promise.all([
      getMoodEntries(),
      getTodaysMoodEntry()
    ]);
    setMoodEntries(allEntries);
    setTodaysMood(todayEntry);
  } catch (err) {
    console.error("Error fetching mood data:", err);
    setMoodError(err);
    toast.error(err.response?.data?.message || "Failed to load mood data.");
  } finally {
    setIsLoadingMoods(false);
  }
}, []);


  // Effect to run on component mount and authentication state changes
  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  // Function to submit or update mood
  const submitMood = useCallback(async (mood, notes) => {
    if (!isAuthenticated || !user?._id) {
      toast.error("You must be logged in to track your mood.");
      return;
    }

    setIsSubmittingMood(true);
    setMoodError(null);
    try {
      const updatedEntry = await createOrUpdateMoodEntry(mood, notes);
      toast.success(todaysMood ? "Mood entry updated!" : "Mood tracked for today!");
      // Re-fetch all mood data to ensure lists are fresh
      await fetchMoodData();
      return updatedEntry;
    } catch (err) {
      console.error("Error submitting mood:", err);
      setMoodError(err);
      toast.error(err.response?.data?.message || "Failed to submit mood.");
      return null;
    } finally {
      setIsSubmittingMood(false);
    }
  }, [isAuthenticated, user, todaysMood, fetchMoodData]);

  // Function to delete a mood entry
  const removeMoodEntry = useCallback(async (entryId) => {
    if (!isAuthenticated || !user?._id) {
      toast.error("You must be logged in to delete mood entries.");
      return;
    }

    setIsSubmittingMood(true); 
    setMoodError(null);
    try {
      await deleteMoodEntry(entryId);
      toast.success("Mood entry deleted.");
      await fetchMoodData(); 
    } catch (err) {
      console.error("Error deleting mood entry:", err);
      setMoodError(err);
      toast.error(err.response?.data?.message || "Failed to delete mood entry.");
    } finally {
      setIsSubmittingMood(false);
    }
  }, [isAuthenticated, user, fetchMoodData]);


  // Helper to get mood emoji/icon for display
  const getMoodIcon = useCallback((mood) => {
    switch (mood) {
      case 'very_happy': return '😊';
      case 'happy': return '🙂';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      case 'very_sad': return '😢';
      default: return '😐';
    }
  }, []);

  // Helper to get mood color for display (e.g., for badges)
  const getMoodColor = useCallback((mood) => {
    switch (mood) {
      case 'very_happy': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'happy': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'neutral': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'sad': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'very_sad': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }, []);


  return {
    moodEntries,
    todaysMood,
    isLoadingMoods,
    moodError,
    isSubmittingMood,
    submitMood,
    removeMoodEntry,
    getMoodIcon,
    getMoodColor,
    fetchMoodData 
  };
};
