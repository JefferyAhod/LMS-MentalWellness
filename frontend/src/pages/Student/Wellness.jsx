import React, { useState, useEffect } from "react";
// Removed direct entity imports, as data flow is now handled by hooks
// import { User } from "@/entities/User";
// import { MoodEntry } from "@/entities/MoodEntry";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Smile,
  Frown,
  Meh,
  Activity,
  Brain,
  MessageCircle,
  TrendingUp,
  Calendar,
  Lightbulb,
  Loader2 // Added for loading state
} from "lucide-react";

import MoodTracker from "../../components/MoodTracker";
import WellnessTips from "../../components/WellnessTips";
import CounselorChat from "../../components/CounselorChat";
import { Link } from "react-router-dom";

// Import your custom hooks for authentication and mood tracking
import { useAuth } from '@/context/AuthContext';
import { useMoodTracker } from '../../hooks/useMoodTracker'; // Adjust path if necessary

export default function Wellness() {
  // Use data and loading states directly from your hooks
  const { user, loading: authLoading } = useAuth();
  const {
    moodEntries,
    todaysMood,
    isLoadingMoods, // Represents loading state for mood data
    isSubmittingMood, // Represents loading state for mood submission
    submitMood, // Function to handle mood creation/update
    // fetchMoodData, // Not directly used here, as submitMood re-fetches
    getMoodIcon, // Helper from hook for icons
    getMoodColor // Helper from hook for colors
  } = useMoodTracker();

  const [showCounselor, setShowCounselor] = useState(false);

  // useEffect is no longer needed to manually call loadWellnessData,
  // as useMoodTracker's internal useEffect handles initial data fetching.
  useEffect(() => {
    // You can add other side effects here if needed,
    // e.g., logging or analytics once data is loaded.
  }, [user, moodEntries, todaysMood]); // Dependencies can be based on your logic

  // This function now uses the submitMood from useMoodTracker hook
  const handleMoodSubmit = async (mood, notes) => {
    // The submitMood function from the hook handles if it's an update or new creation,
    // and automatically reloads mood data.
    await submitMood(mood, notes);
  };

  // Helper function for weekly trend remains in Wellness.jsx
  const getWeeklyMoodTrend = () => {
    const lastWeek = moodEntries.slice(0, 7); // Assuming moodEntries are already sorted by date descending
    const moodValues = {
      very_sad: 1,
      sad: 2,
      neutral: 3,
      happy: 4,
      very_happy: 5
    };

    // Ensure lastWeek is not empty to avoid division by zero
    if (lastWeek.length === 0) return 3; // Default to neutral if no entries

    const average = lastWeek.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / lastWeek.length;
    return average;
  };

  // Combine loading states from both hooks
  if (authLoading || isLoadingMoods) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  // Check if user is logged in after authentication loading
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access wellness features
          </h2>
          <Button>
            <Link to='/login'>Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Main UI remains unchanged
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Wellness Center
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Take care of your mental health and wellbeing
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Mood Entries</p>
                  <p className="text-3xl font-bold">{moodEntries.length}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Weekly Average</p>
                  <p className="text-3xl font-bold">{getWeeklyMoodTrend().toFixed(1)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Today's Mood</p>
                  <div className="flex items-center gap-2">
                    {todaysMood ? getMoodIcon(todaysMood.mood) : <Meh className="w-8 h-8 text-indigo-200" />}
                    <span className="text-lg font-semibold">
                      {todaysMood ? todaysMood.mood.replace('_', ' ') : 'Not set'}
                    </span>
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mood Tracker */}
          <div className="lg:col-span-2">
            <MoodTracker
              onMoodSubmit={handleMoodSubmit}
              todaysMood={todaysMood}
              // moodEntries prop is not passed here as MoodTracker typically handles new entries, not displays all.
              // If MoodTracker needs moodEntries, ensure it uses its own props or context.
              // Your MoodTracker.jsx (provided previously) uses its own internal state, so no change needed here.
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WellnessTips />

            {/* Counselor Support */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Need Support?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you're struggling with stress, anxiety, or any mental health concerns,
                  our counselors are here to help.
                </p>
                <Button
                  onClick={() => setShowCounselor(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Talk to a Counselor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Mood History */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Mood History</CardTitle>
          </CardHeader>
          <CardContent>
            {moodEntries.length > 0 ? (
              <div className="space-y-4">
                {moodEntries.slice(0, 7).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getMoodIcon(entry.mood)} {/* Using getMoodIcon from useMoodTracker */}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getMoodColor(entry.mood)}> {/* Using getMoodColor from useMoodTracker */}
                      {entry.mood.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Start tracking your mood to see your wellness journey
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Counselor Chat Modal */}
      {showCounselor && (
        <CounselorChat onClose={() => setShowCounselor(false)} />
      )}
    </div>
  );
}