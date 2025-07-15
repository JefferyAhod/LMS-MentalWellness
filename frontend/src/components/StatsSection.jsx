import React from "react";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Active Students",
      color: "bg-blue-500"
    },
    {
      icon: BookOpen,
      value: "1,200+",
      label: "Expert Courses",
      color: "bg-purple-500"
    },
    {
      icon: Award,
      value: "25,000+",
      label: "Certificates Earned",
      color: "bg-green-500"
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Success Rate",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}