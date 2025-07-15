import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Course } from "@/entities/Course";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload, 
  Play,
  Save,
  Eye
} from "lucide-react";


export default function CreateCourse() {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    price: 0,
    thumbnail: "",
    chapters: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const categories = [
    { id: "programming", name: "Programming" },
    { id: "design", name: "Design" },
    { id: "business", name: "Business" },
    { id: "marketing", name: "Marketing" },
    { id: "data-science", name: "Data Science" },
    { id: "photography", name: "Photography" },
    { id: "music", name: "Music" },
    { id: "language", name: "Language" },
    { id: "health", name: "Health & Fitness" },
    { id: "other", name: "Other" }
  ];

  const levels = [
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" }
  ];

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await UploadFile({ file });
      setCourseData(prev => ({ ...prev, thumbnail: file_url }));
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    }
  };

  const addChapter = () => {
    setCourseData(prev => ({
      ...prev,
      chapters: [...prev.chapters, { title: "", lectures: [] }]
    }));
  };

  const updateChapter = (index, field, value) => {
    setCourseData(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) => 
        i === index ? { ...chapter, [field]: value } : chapter
      )
    }));
  };

  const removeChapter = (index) => {
    setCourseData(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index)
    }));
  };

  const addLecture = (chapterIndex) => {
    setCourseData(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) => 
        i === chapterIndex 
          ? { 
              ...chapter, 
              lectures: [...chapter.lectures, { 
                title: "", 
                video_url: "", 
                duration: 0, 
                is_preview_free: false 
              }] 
            }
          : chapter
      )
    }));
  };

  const updateLecture = (chapterIndex, lectureIndex, field, value) => {
    setCourseData(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) => 
        i === chapterIndex 
          ? {
              ...chapter,
              lectures: chapter.lectures.map((lecture, j) => 
                j === lectureIndex ? { ...lecture, [field]: value } : lecture
              )
            }
          : chapter
      )
    }));
  };

  const removeLecture = (chapterIndex, lectureIndex) => {
    setCourseData(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) => 
        i === chapterIndex 
          ? {
              ...chapter,
              lectures: chapter.lectures.filter((_, j) => j !== lectureIndex)
            }
          : chapter
      )
    }));
  };

  const calculateTotalDuration = () => {
    return courseData.chapters.reduce((total, chapter) => 
      total + chapter.lectures.reduce((sum, lecture) => sum + (lecture.duration || 0), 0), 0
    );
  };

  const handleSubmit = async (isDraft = false) => {
    setIsSubmitting(true);
    try {
      const user = await User.me();
      const totalDuration = calculateTotalDuration();

      const newCourse = await Course.create({
        ...courseData,
        instructor_id: user.id,
        instructor_name: user.full_name,
        duration: totalDuration,
        is_published: !isDraft,
        total_enrollments: 0,
        average_rating: 0,
        is_featured: false
      });

      navigate(createPageUrl("EducatorDashboard"));
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: "Basic Info", description: "Course details and settings" },
    { id: 2, name: "Curriculum", description: "Add chapters and lectures" },
    { id: 3, name: "Review", description: "Review and publish" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("EducatorDashboard"))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Course
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share your knowledge with the world
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : step.id < currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">{step.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
                {step.id < steps.length && (
                  <div className={`w-24 h-1 mx-4 ${
                    step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Title
                </label>
                <Input
                  value={courseData.title}
                  onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Complete React Development Course"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what students will learn in this course..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <Select value={courseData.category} onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Level
                  </label>
                  <Select value={courseData.level} onValueChange={(value) => setCourseData(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={courseData.price}
                    onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0 for free"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Thumbnail
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    {courseData.thumbnail ? (
                      <img 
                        src={courseData.thumbnail} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload">
                      <Button variant="outline" as="span" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Thumbnail
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} disabled={!courseData.title || !courseData.description}>
                  Next: Add Curriculum
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Curriculum */}
        {currentStep === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Course Curriculum</CardTitle>
                <Button onClick={addChapter} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Chapter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {courseData.chapters.length > 0 ? (
                <div className="space-y-6">
                  {courseData.chapters.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Input
                          value={chapter.title}
                          onChange={(e) => updateChapter(chapterIndex, 'title', e.target.value)}
                          placeholder="Chapter title"
                          className="flex-1 mr-4"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChapter(chapterIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {chapter.lectures.map((lecture, lectureIndex) => (
                          <div key={lectureIndex} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <Input
                                value={lecture.title}
                                onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'title', e.target.value)}
                                placeholder="Lecture title"
                              />
                              <Input
                                value={lecture.video_url}
                                onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'video_url', e.target.value)}
                                placeholder="Video URL"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                type="number"
                                value={lecture.duration}
                                onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'duration', parseInt(e.target.value) || 0)}
                                placeholder="Duration (minutes)"
                                className="w-32"
                              />
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={lecture.is_preview_free}
                                  onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'is_preview_free', e.target.checked)}
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Free preview
                                </span>
                              </label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLecture(chapterIndex, lectureIndex)}
                                className="text-red-500 hover:text-red-700 ml-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLecture(chapterIndex)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Lecture
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No chapters yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add your first chapter to get started
                  </p>
                  <Button onClick={addChapter}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Chapter
                  </Button>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Previous
                </Button>
                <Button onClick={() => setCurrentStep(3)} disabled={courseData.chapters.length === 0}>
                  Next: Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Review & Publish</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Course Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Course Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
                      <p className="font-medium text-gray-900 dark:text-white">{courseData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {courseData.price === 0 ? 'Free' : `$${courseData.price}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Chapters</p>
                      <p className="font-medium text-gray-900 dark:text-white">{courseData.chapters.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {Math.floor(calculateTotalDuration() / 60)}h {calculateTotalDuration() % 60}m
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chapters Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Curriculum Overview
                  </h3>
                  <div className="space-y-3">
                    {courseData.chapters.map((chapter, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Chapter {index + 1}: {chapter.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {chapter.lectures.length} lectures • {chapter.lectures.reduce((sum, l) => sum + (l.duration || 0), 0)} minutes
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Previous
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSubmit(true)}
                      disabled={isSubmitting}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button 
                      onClick={() => handleSubmit(false)}
                      disabled={isSubmitting}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Publish Course
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}