"use client";

import { useState } from "react";
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
} from "lucide-react";

import { completeStudentOnboarding } from "@/api/student";

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

  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, value) => {
    setFormData((prev) => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const handleNext = () => step < steps.length - 1 && setStep(step + 1);
  const handlePrev = () => step > 0 && setStep(step - 1);

const handleSubmit = async () => {
  try {
    await completeStudentOnboarding(formData);
    toast.success("Onboarding completed!");
    navigate("/dashboard");
  } catch (error) {
    const raw = error?.response?.data?.message || "Failed to complete onboarding";

    if (raw.includes("StudentProfile validation failed")) {
      const matches = raw.match(/`([^`]+)`/g);
      const fields = matches?.map((field) => field.replace(/`/g, "")) || [];
      toast.error(`Please fill all required fields: ${fields.join(", ")}`);
    } else {
      toast.error(raw);
    }
  }
};


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
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold ${
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
              <Button onClick={handleSubmit}>Finish</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
