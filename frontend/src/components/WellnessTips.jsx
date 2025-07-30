import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react"; // Added Loader2, removed RefreshCw and Button

// Import the necessary hooks
import { useAuth } from '@/context/AuthContext';
import { useWellnessInsights } from "../hooks/useAi";

export default function WellnessTips() {
  const { user, loading: authLoading } = useAuth(); // Get user for fetching insights
  const [triggerInsightsFetch, setTriggerInsightsFetch] = useState(false);

  // Define moodDataForInsights locally for this component
  const moodDataForInsights = {
    userId: user?._id,
    // Note: We're not passing moodEntries.length directly from Wellness.jsx to here,
    // so this insight might not re-fetch immediately if mood entries change *only* in the parent.
    // For simplicity given the instruction, this component will fetch its own insight on mount/user change.
  };

  // Use the useWellnessInsights hook directly in WellnessTips
  const {
    insight,
    isLoading: isInsightLoading,
    error: insightError
  } = useWellnessInsights(moodDataForInsights, triggerInsightsFetch);

  // Effect to trigger insights fetch once user is available and not loading
  useEffect(() => {
    if (user && !authLoading && !triggerInsightsFetch) {
      setTriggerInsightsFetch(true);
    }
  }, [user, authLoading, triggerInsightsFetch]);


  // Handle loading states
  if (authLoading || (triggerInsightsFetch && isInsightLoading)) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI Wellness Insight
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin mr-2" /> Generating insights...
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (insightError) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI Wellness Insight
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-red-500">
          Error loading insight: {insightError}
        </CardContent>
      </Card>
    );
  }

  // Display the insight
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          AI Wellness Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insight ? (
          <p className="text-gray-700 dark:text-gray-300">
            {insight}
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            AI insights will appear here once your mood data is analyzed.
          </p>
        )}
      </CardContent>
    </Card>
  );
}