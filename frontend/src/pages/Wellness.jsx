import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { MoodEntry } from "@/entities/MoodEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Lightbulb
} from "lucide-react";

import MoodTracker from "../components/MoodTracker";
import WellnessTips from "../components/WellnessTips";
import CounselorChat from "../components/CounselorChat";
import { Link } from "react-router-dom";

export default function Wellness() {
  const [user, setUser] = useState(null);
  const [moodEntries, setMoodEntries] = useState([]);
  const [todaysMood, setTodaysMood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCounselor, setShowCounselor] = useState(false);

  useEffect(() => {
    loadWellnessData();
  }, []);

  const loadWellnessData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const entries = await MoodEntry.filter({ user_id: userData.id }, "-date");
      setMoodEntries(entries);

      // Check if user has mood entry for today
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find(entry => entry.date === today);
      setTodaysMood(todayEntry);
    } catch (error) {
      console.error("Error loading wellness data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSubmit = async (mood, notes) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (todaysMood) {
        // Update existing entry
        await MoodEntry.update(todaysMood.id, { mood, notes });
      } else {
        // Create new entry
        await MoodEntry.create({
          user_id: user.id,
          mood,
          notes,
          date: today
        });
      }

      loadWellnessData();
    } catch (error) {
      console.error("Error submitting mood:", error);
    }
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'very_happy':
        return <Smile className="w-8 h-8 text-green-500" />;
      case 'happy':
        return <Smile className="w-8 h-8 text-yellow-500" />;
      case 'neutral':
        return <Meh className="w-8 h-8 text-gray-500" />;
      case 'sad':
        return <Frown className="w-8 h-8 text-orange-500" />;
      case 'very_sad':
        return <Frown className="w-8 h-8 text-red-500" />;
      default:
        return <Meh className="w-8 h-8 text-gray-500" />;
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'very_happy': return 'bg-green-100 text-green-800';
      case 'happy': return 'bg-yellow-100 text-yellow-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'sad': return 'bg-orange-100 text-orange-800';
      case 'very_sad': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    
    const average = lastWeek.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / lastWeek.length;
    return average || 3;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access wellness features
          </h2>
          <Button  onClick={() => User.login()}>
           <Link to='/login'>Log In </Link>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mood Tracker */}
          <div className="lg:col-span-2">
            <MoodTracker
              onMoodSubmit={handleMoodSubmit}
              todaysMood={todaysMood}
              moodEntries={moodEntries}
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

      {/* Counselor Chat Modal */}
      {showCounselor && (
        <CounselorChat onClose={() => setShowCounselor(false)} />
      )}
    </div>
  );
}