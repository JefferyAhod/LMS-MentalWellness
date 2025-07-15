"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap,
  Clock,
  BrainCircuit,
  Target,
  Users,
  Sparkles,
  BookOpenText,
  Lightbulb,
  Stars,
  MapPin,
  Goal,
} from "lucide-react";

const steps = [
  { label: "Profile", icon: <GraduationCap className="w-5 h-5" /> },
  { label: "Preferences", icon: <Clock className="w-5 h-5" /> },
  { label: "Learning Style", icon: <BrainCircuit className="w-5 h-5" /> },
  { label: "Goals", icon: <Target className="w-5 h-5" /> },
  { label: "Discipline", icon: <Users className="w-5 h-5" /> },
];

const disciplines = [
  "Economics",
  "Computer Science",
  "Mathematics",
  "Physics",
  "Biology",
  "Chemistry",
  "Psychology",
  "Business",
  "Engineering",
  "Medicine",
];

export default function LandingOnboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCheckboxChange = (key, value) => {
    setFormData((prev) => {
      const current = new Set(prev[key] || []);
      current.has(value) ? current.delete(value) : current.add(value);
      return { ...prev, [key]: Array.from(current) };
    });
  };

  const handleNext = () => step < steps.length - 1 && setStep(step + 1);
  const handlePrev = () => step > 0 && setStep(step - 1);
  const handleSubmit = () => {
    console.log("Form Data:", formData);
    alert("Setup Complete! Redirecting...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-3xl p-6 md:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-900">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="h-8 w-8 text-indigo-500" />
          </div>
          <CardTitle className="text-3xl font-semibold text-gray-800 dark:text-white">
            Let’s personalize your experience
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-300 max-w-xl mx-auto">
            Answer a few quick questions so we can tailor your learning journey just for you.
          </p>
        </CardHeader>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 px-6 relative">
          {steps.map((s, index) => (
            <div key={s.label} className="flex flex-col items-center text-sm font-medium relative z-10">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
                  index === step
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : index < step
                    ? "bg-green-500 text-white border-green-500"
                    : "text-gray-500 border-gray-300"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-xs ${
                  index <= step ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-300 dark:bg-gray-700 z-0">
            <div
              className="h-0.5 bg-indigo-500 transition-all duration-500"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <CardContent className="space-y-6 px-4 md:px-8">
          {step === 0 && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>Where and what are you studying?</span>
              </div>
              <Input placeholder="University Name" onChange={(e) => handleChange("university", e.target.value)} />
              <Input placeholder="Major / Course of Study" onChange={(e) => handleChange("major", e.target.value)} />
              <Select onValueChange={(val) => handleChange("semester", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      Semester {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>How do you prefer to study and when?</span>
              </div>
              <Select onValueChange={(val) => handleChange("study_style", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Study Style" />
                </SelectTrigger>
                <SelectContent>
                  {["individual", "group", "mixed"].map((val) => (
                    <SelectItem key={val} value={val}>
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(val) => handleChange("study_time", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Most Productive Hours" />
                </SelectTrigger>
                <SelectContent>
                  {["early_morning", "morning", "afternoon", "evening", "night", "late_night"].map((val) => (
                    <SelectItem key={val} value={val}>
                      {val.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Lightbulb className="w-4 h-4 text-indigo-500" />
                <span>Pick the styles that help you learn best</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["visual", "auditory", "reading", "kinesthetic"].map((style) => (
                  <label
                    key={style}
                    className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 p-2 rounded-lg transition"
                  >
                    <Checkbox
                      checked={formData.learning_style?.includes(style)}
                      onCheckedChange={() => handleCheckboxChange("learning_style", style)}
                    />
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Goal className="w-4 h-4 text-indigo-500" />
                <span>What are you hoping to achieve?</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["grades", "understanding", "time_mgmt", "exam_prep"].map((goal) => (
                  <label
                    key={goal}
                    className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 p-2 rounded-lg transition"
                  >
                    <Checkbox
                      checked={formData.goals?.includes(goal)}
                      onCheckedChange={() => handleCheckboxChange("goals", goal)}
                    />
                    {goal.replace("_", " ")}
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <BookOpenText className="w-4 h-4 text-indigo-500" />
                <span>Select your academic discipline (optional)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {disciplines.map((d) => (
                  <label
                    key={d}
                    className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 p-2 rounded-lg transition"
                  >
                    <Checkbox
                      checked={formData.discipline?.includes(d.toLowerCase())}
                      onCheckedChange={() => handleCheckboxChange("discipline", d.toLowerCase())}
                    />
                    {d}
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={handlePrev} disabled={step === 0}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={handleNext}>Continue</Button>
            ) : (
              <Button onClick={handleSubmit}>Finish</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
