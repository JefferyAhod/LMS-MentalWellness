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
  User,
  Briefcase,
  Calendar,
  Video,
  Users,
  BookText,
  MessageCircleQuestion,
  Upload,
} from "lucide-react";

const steps = [
  { label: "Profile", icon: <User className="w-5 h-5" /> },
  { label: "Preferences", icon: <Calendar className="w-5 h-5" /> },
  { label: "Teaching Tools", icon: <Video className="w-5 h-5" /> },
  { label: "Vision", icon: <MessageCircleQuestion className="w-5 h-5" /> },
  { label: "Verification", icon: <Upload className="w-5 h-5" /> },
];

export default function EducatorOnboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, value) => {
    const current = new Set(formData[key] || []);
    current.has(value) ? current.delete(value) : current.add(value);
    setFormData((prev) => ({ ...prev, [key]: Array.from(current) }));
  };

  const handleNext = () => step < steps.length - 1 && setStep(step + 1);
  const handlePrev = () => step > 0 && setStep(step - 1);
  const handleSubmit = () => {
    console.log("Educator Data:", formData);
    alert("Your educator application has been submitted for review.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-3xl p-6 md:p-10 rounded-3xl shadow-2xl bg-white dark:bg-gray-900">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold text-gray-800 dark:text-white">
            Educator Onboarding
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Fill out this short form to apply as an educator on LectureMate.
          </p>
        </CardHeader>

        {/* Steps Progress */}
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
              <Input placeholder="Full Name" onChange={(e) => handleChange("name", e.target.value)} />
              <Input placeholder="Area of Expertise" onChange={(e) => handleChange("expertise", e.target.value)} />
              <Input placeholder="Institution or Organization" onChange={(e) => handleChange("institution", e.target.value)} />
              <Select onValueChange={(val) => handleChange("experience", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Years of Teaching Experience" />
                </SelectTrigger>
                <SelectContent>
                  {["<1", "1-3", "3-5", "5+"].map((exp) => (
                    <SelectItem key={exp} value={exp}>{exp} years</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {step === 1 && (
            <>
              <Select onValueChange={(val) => handleChange("teaching_mode", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Preferred Teaching Mode" />
                </SelectTrigger>
                <SelectContent>
                  {["Online", "In-person", "Hybrid"].map((mode) => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(val) => handleChange("availability", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Available Time Slot" />
                </SelectTrigger>
                <SelectContent>
                  {["Morning", "Afternoon", "Evening", "Flexible"].map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(val) => handleChange("group_size", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Preferred Student Group Size" />
                </SelectTrigger>
                <SelectContent>
                  {["1-5", "6-15", "15+"].map((size) => (
                    <SelectItem key={size} value={size}>{size} students</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {["Zoom", "Google Meet", "LMS", "Blackboard"].map((platform) => (
                  <label key={platform} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.platforms?.includes(platform)}
                      onCheckedChange={() => handleCheckboxChange("platforms", platform)}
                    />
                    {platform}
                  </label>
                ))}
              </div>
              <label className="text-sm text-gray-600 dark:text-gray-300 mt-4 block">
                Upload Sample Content (e.g. a file or a video link)
              </label>
              <Input
                placeholder="Link or File Name"
                onChange={(e) => handleChange("sample_link", e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.has_digital_experience || false}
                  onCheckedChange={() => handleChange("has_digital_experience", !formData.has_digital_experience)}
                />
                <span>I have experience creating digital content</span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Input
                placeholder="Why do you want to teach on LectureMate?"
                onChange={(e) => handleChange("motivation", e.target.value)}
              />
              <Input
                placeholder="Subjects you intend to teach"
                onChange={(e) => handleChange("subjects", e.target.value)}
              />
              <Input
                placeholder="What unique value do you bring?"
                onChange={(e) => handleChange("value_proposition", e.target.value)}
              />
            </>
          )}

          {step === 4 && (
            <>
              <Input
                type="file"
                onChange={(e) => handleChange("credentials", e.target.files[0]?.name)}
              />
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  checked={formData.agree_terms || false}
                  onCheckedChange={() => handleChange("agree_terms", !formData.agree_terms)}
                />
                <span>I acknowledge the terms and confirm all information is accurate</span>
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
              <Button onClick={handleSubmit}>Submit Application</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
