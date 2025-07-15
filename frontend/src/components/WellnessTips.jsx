import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";

export default function WellnessTips() {
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      title: "Take Deep Breaths",
      content: "When feeling stressed, try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.",
      icon: "🧘‍♀️"
    },
    {
      title: "Stay Hydrated",
      content: "Drinking enough water can improve your mood and energy levels throughout the day.",
      icon: "💧"
    },
    {
      title: "Move Your Body",
      content: "Even a 10-minute walk can boost your mood and reduce stress levels.",
      icon: "🚶‍♀️"
    },
    {
      title: "Practice Gratitude",
      content: "Write down 3 things you're grateful for each day to cultivate positivity.",
      icon: "🙏"
    },
    {
      title: "Connect with Others",
      content: "Reach out to friends or family. Social connections are vital for mental health.",
      icon: "💬"
    },
    {
      title: "Limit Screen Time",
      content: "Take regular breaks from screens to reduce eye strain and mental fatigue.",
      icon: "📱"
    },
    {
      title: "Get Quality Sleep",
      content: "Aim for 7-9 hours of sleep. Good sleep is essential for emotional regulation.",
      icon: "😴"
    },
    {
      title: "Practice Mindfulness",
      content: "Spend 5 minutes focusing on the present moment to reduce anxiety.",
      icon: "🧠"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000); // Change tip every 10 seconds

    return () => clearInterval(interval);
  }, [tips.length]);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Daily Wellness Tip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl mb-4">{tips[currentTip].icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {tips[currentTip].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {tips[currentTip].content}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={nextTip}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Next Tip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}