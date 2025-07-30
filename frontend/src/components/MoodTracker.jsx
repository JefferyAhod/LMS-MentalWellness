import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2 } from "lucide-react"; // Import Loader2 for submitting state

export default function MoodTracker({
  onMoodSubmit,
  todaysMood,
  moodEntries,
  // Removed getMoodIcon, getMoodColor from props as MoodTracker handles these internally
}) {
  const [selectedMood, setSelectedMood] = useState(todaysMood?.mood || null);
  const [notes, setNotes] = useState(todaysMood?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define moods with explicit background colors for the chart
  const moods = [
    { id: 'very_sad', label: 'Very Sad', emoji: '😢', bgColor: 'bg-red-500' },
    { id: 'sad', label: 'Sad', emoji: '😞', bgColor: 'bg-orange-500' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', bgColor: 'bg-gray-500' },
    { id: 'happy', label: 'Happy', emoji: '😊', bgColor: 'bg-yellow-500' },
    { id: 'very_happy', label: 'Very Happy', emoji: '😄', bgColor: 'bg-green-500' }
  ];

  // Effect to update internal state when todaysMood prop changes
  useEffect(() => {
    setSelectedMood(todaysMood?.mood || null);
    setNotes(todaysMood?.notes || "");
  }, [todaysMood]);

  // Helper to get emoji for display
  const getEmoji = (moodId) => {
    const mood = moods.find(m => m.id === moodId);
    return mood ? mood.emoji : '�';
  };

  // Helper to get background color class for chart bars and buttons
  const getBackgroundColorClass = (moodId) => {
    const mood = moods.find(m => m.id === moodId);
    return mood ? mood.bgColor : 'bg-gray-400'; // Default for safety
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    await onMoodSubmit(selectedMood, notes);
    setIsSubmitting(false);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-500" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Conditional display for today's logged mood */}
        {todaysMood ? (
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm mb-6">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              You've logged your mood for today!
            </p>
            <div className="flex items-center justify-center gap-2 text-xl font-bold mb-4">
              <span className="text-3xl">{getEmoji(todaysMood.mood)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBackgroundColorClass(todaysMood.mood).replace('bg-', 'text-')}`}>
                {todaysMood.mood.replace('_', ' ')}
              </span>
            </div>
            {todaysMood.notes && (
              <p className="text-gray-600 dark:text-gray-400 italic">"{todaysMood.notes}"</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">
              You can update it below if needed.
            </p>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm mb-6">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              It looks like you haven't tracked your mood yet today.
            </p>
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </div>
        )}

        {/* Mood Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                selectedMood === mood.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              } flex flex-col items-center justify-center space-y-2`}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mood.label}
              </div>
            </button>
          ))}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's on your mind? How are you feeling today?"
            className="min-h-[100px]"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : todaysMood ? (
            "Update Mood"
          ) : (
            "Save Mood"
          )}
        </Button>

        {/* Mood Chart - Remains within MoodTracker as per your latest code */}
        {moodEntries?.length > 0 && ( // Added optional chaining for safety
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Your Mood Trend (Last {Math.min(moodEntries.length, 7)} Days)
            </h4>
            <div className="flex items-end gap-2 h-24">
              {moodEntries.slice(0, 7).reverse().map((entry, index) => { // Reverse to show recent first on right
                const moodValue = moods.findIndex(m => m.id === entry.mood) + 1;
                const height = (moodValue / 5) * 100;
                
                return (
                  <div key={entry.id || index} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t transition-all ${getBackgroundColorClass(entry.mood)}`} // Use dynamic background color
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}