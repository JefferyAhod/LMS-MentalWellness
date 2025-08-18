import React, { useState, useEffect, useRef } from "react"; // Added useRef
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
  Loader2 
} from "lucide-react";

import MoodTracker from "../../components/MoodTracker";
// import WellnessTips from "../../components/WellnessTips";
import CounselorChat from "../../components/CounselorChat"; 
import { Link } from "react-router-dom";

import { useAuth } from '@/context/AuthContext';
import { useMoodTracker } from '../../hooks/useMoodTracker'; 

export default function Wellness() {
  const { user, loading: authLoading } = useAuth();
  const {
    moodEntries,
    todaysMood,
    isLoadingMoods,
    isSubmittingMood,
    submitMood,
    getMoodIcon,
    getMoodColor,
    counselorMessageQueue, // NEW: Get the message queue
    setCounselorMessageQueue // NEW: Get the setter for the message queue
  } = useMoodTracker();

  // NEW: Ref to directly call sendMessage on CounselorChat's exposed function
  const counselorChatRef = useRef();

  // NEW: Effect to send message to counselor chat when queue is not null
  useEffect(() => {
    if (counselorMessageQueue && counselorChatRef.current && counselorChatRef.current.sendMessage) {
      counselorChatRef.current.sendMessage(counselorMessageQueue);
      setCounselorMessageQueue(null); // Clear the queue after sending
    }
  }, [counselorMessageQueue, setCounselorMessageQueue]); // Depend on queue state


  const handleMoodSubmit = async (mood, notes) => {
    await submitMood(mood, notes);
  };

  const getWeeklyMoodTrend = () => {
    const lastWeek = moodEntries.slice(0, 7);
    const moodValues = {
      very_sad: 1,
      sad: 2,
      neutral: 3,
      happy: 4,
      very_happy: 5
    };

    if (lastWeek.length === 0) return 3; 

    const average = lastWeek.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / lastWeek.length;
    return average;
  };

  if (authLoading || isLoadingMoods) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

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

        {/* Main Content Area: Flex Container for Left (Tracker/Tips) and Right (Chat) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section: Mood Tracker & Wellness Tips */}
          <div className="flex-1 lg:col-span-2 space-y-6"> 
            <MoodTracker
              onMoodSubmit={handleMoodSubmit}
              todaysMood={todaysMood}
              isSubmittingMood={isSubmittingMood} 
            />
            {/* <WellnessTips userId={user?._id} moodEntries={moodEntries} />  */}
          </div>

          {/* Right Section: Embedded AI Counselor Chat */}
          <div className="flex-1 lg:w-1/3"> 
            {/* NEW: Pass the ref to CounselorChat */}
            <CounselorChat ref={counselorChatRef} /> 
          </div>
        </div>

        {/* Recent Mood History - remains below the main two-column layout */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Mood History</CardTitle>
          </CardHeader>
          <CardContent>
            {moodEntries.length > 0 ? (
              <div className="space-y-4">
                {moodEntries.slice(0, 7).map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getMoodIcon(entry.mood)}
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
                    <Badge className={getMoodColor(entry.mood)}> 
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
    </div>
  );
}
