import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Frown, Meh, Heart } from "lucide-react";

export default function MoodTracker({ onMoodSubmit, todaysMood, moodEntries }) {
  const [selectedMood, setSelectedMood] = useState(todaysMood?.mood || null);
  const [notes, setNotes] = useState(todaysMood?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { id: 'very_sad', label: 'Very Sad', emoji: '😢', color: 'text-red-500' },
    { id: 'sad', label: 'Sad', emoji: '😞', color: 'text-orange-500' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-gray-500' },
    { id: 'happy', label: 'Happy', emoji: '😊', color: 'text-yellow-500' },
    { id: 'very_happy', label: 'Very Happy', emoji: '😄', color: 'text-green-500' }
  ];

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
        {/* Mood Selection */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                selectedMood === mood.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
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
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Saving..." : todaysMood ? "Update Mood" : "Save Mood"}
        </Button>

        {/* Mood Chart */}
        {moodEntries.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Your Mood Trend (Last 7 Days)
            </h4>
            <div className="flex items-end gap-2 h-24">
              {moodEntries.slice(0, 7).map((entry, index) => {
                const moodValue = moods.findIndex(m => m.id === entry.mood) + 1;
                const height = (moodValue / 5) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-purple-500 rounded-t transition-all"
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