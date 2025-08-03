"use client";

import { useState, useCallback, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  GraduationCap,
  Clock,
  BrainCircuit,
  Target,
  Users,
  Sparkles,
  Loader2,
} from "lucide-react";

import { completeStudentOnboarding } from "@/api/student";
import { useAuth } from "@/context/AuthContext.jsx";


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

export default function StudentOnboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    university: "",
    major: "",
    semester: "",
    studyStyle: "",
    studyTime: "",
    learningStyle: [],
    goals: [],
    discipline: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated, isOnboardingComplete, loading: authLoading, updateUserOnboardingStatus } = useAuth();

  // Redirect logic based on authentication and onboarding status,
  // consistent with the EducatorOnboarding component.
  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth state to resolve
    }

    if (!isAuthenticated) {
      toast.info("Please log in to complete onboarding.");
      navigate("/Login");
      return;
    }

    if (user && user.role === 'student') {
      if (isOnboardingComplete) {
        toast.info("Onboarding already completed.");
        navigate("/StudentDashboard");
        return;
      }
    } else if (user && user.role !== 'student') {
      toast.warn("You do not have access to student onboarding.");
      navigate("/Home");
    }
  }, [isAuthenticated, isOnboardingComplete, user, authLoading, navigate]);

  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCheckboxChange = useCallback((key, value) => {
    setFormData((prev) => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  }, []);

  // Updated to include front-end validation before moving to the next step
  const handleNext = useCallback(() => {
    let isValid = true;
    if (step === 0) {
      if (!formData.university || !formData.major || !formData.semester) {
        toast.error("Please fill in all profile details.");
        isValid = false;
      }
    } else if (step === 1) {
      if (!formData.studyStyle || !formData.studyTime) {
        toast.error("Please select all preferences.");
        isValid = false;
      }
    } else if (step === 2) {
      if (formData.learningStyle.length === 0) {
        toast.error("Please select at least one learning style.");
        isValid = false;
      }
    } else if (step === 3) {
      if (formData.goals.length === 0) {
        toast.error("Please select at least one learning goal.");
        isValid = false;
      }
    }

    if (isValid && step < steps.length - 1) {
      setStep((prev) => prev + 1);
    }
  }, [step, formData]);

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  // Updated to use the same submission logic as EducatorOnboarding
  const handleSubmit = useCallback(async () => {
    // Final validation for the last step
    if (formData.discipline.length === 0) {
      toast.error("Please select at least one discipline.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit student-specific profile data
      await completeStudentOnboarding(formData);

      // 2. Mark general user onboarding as complete in the AuthContext and on the User model in backend
      const updateResult = await updateUserOnboardingStatus();
      if (!updateResult.success) {
        throw new Error(updateResult.message || "Failed to update general onboarding status.");
      }

      toast.success("Onboarding completed!");
      navigate("/StudentDashboard");
    } catch (error) {
      console.error("Student onboarding submission error:", error);
      toast.error(
        error?.response?.data?.message || "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate, updateUserOnboardingStatus]);

  // Render nothing if auth is loading, or if conditions for redirect are met
  if (authLoading || (!isAuthenticated && !authLoading) || (user && user.role === 'student' && isOnboardingComplete)) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-3xl p-8 rounded-xl shadow-lg bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-6 w-6 text-indigo-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Let’s personalize your experience
          </CardTitle>
        </CardHeader>

        {/* Stepper / Numbered Progress Bar */}
        <div className="flex items-center justify-between mb-8 px-6 relative">
          {steps.map((s, index) => (
            <div key={s.label} className="flex flex-col items-center text-sm font-medium relative z-10">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all duration-300 ${
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

        <CardContent className="space-y-6">
          {step === 0 && (
            <>
              <Input
                placeholder="University"
                value={formData.university}
                onChange={(e) => handleChange("university", e.target.value)}
              />
              <Input
                placeholder="Major / Course"
                value={formData.major}
                onChange={(e) => handleChange("major", e.target.value)}
              />
              <Select
                value={formData.semester}
                onValueChange={(val) => handleChange("semester", val)}
              >
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
              <Select
                value={formData.studyStyle}
                onValueChange={(val) => handleChange("studyStyle", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Study Style" />
                </SelectTrigger>
                <SelectContent>
                  {["individual", "group", "mixed"].map((val) => (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.studyTime}
                onValueChange={(val) => handleChange("studyTime", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Productive Time" />
                </SelectTrigger>
                <SelectContent>
                  {["early_morning", "morning", "afternoon", "evening", "night"].map((val) => (
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
              <p className="text-sm text-gray-600 dark:text-gray-300">Learning styles</p>
              <div className="grid grid-cols-2 gap-3">
                {["visual", "auditory", "reading", "kinesthetic"].map((style) => (
                  <label
                    key={style}
                    className="flex items-center gap-2 p-2 rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900"
                  >
                    <input
                      type="checkbox"
                      checked={formData.learningStyle?.includes(style)}
                      onChange={() =>
                        handleCheckboxChange("learningStyle", style)
                      }
                      className="form-checkbox text-indigo-600 w-5 h-5"
                    />
                    <span className="capitalize">{style}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your learning goals</p>
              <div className="grid grid-cols-2 gap-3">
                {["grades", "understanding", "time_mgmt", "exam_prep"].map((goal) => (
                  <label
                    key={goal}
                    className="flex items-center gap-2 p-2 rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900"
                  >
                    <input
                      type="checkbox"
                      checked={formData.goals?.includes(goal)}
                      onChange={() => handleCheckboxChange("goals", goal)}
                      className="form-checkbox text-indigo-600 w-5 h-5"
                    />
                    <span className="capitalize">{goal.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">Discipline</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {disciplines.map((d) => (
                  <label
                    key={d}
                    className="flex items-center gap-2 p-2 rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900"
                  >
                    <input
                      type="checkbox"
                      checked={formData.discipline?.includes(d)}
                      onChange={() => handleCheckboxChange("discipline", d)}
                      className="form-checkbox text-indigo-600 w-5 h-5"
                    />
                    <span>{d}</span>
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
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
