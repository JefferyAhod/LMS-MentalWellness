import React, { useState } from "react";
import { User } from "@/entities/User";
import { Course } from "@/entities/Course";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  Image, 
  Video, 
  BookOpen,
  Wand2,
  Download,
  Copy,
  RefreshCw
} from "lucide-react";

export default function AIContentGenerator() {
  const [user, setUser] = useState(null);
  const [selectedTool, setSelectedTool] = useState("course-outline");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  
  const [inputs, setInputs] = useState({
    topic: "",
    level: "beginner",
    duration: "4",
    style: "professional",
    audience: "",
    additionalContext: ""
  });

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated");
    }
  };

  const tools = [
    {
      id: "course-outline",
      name: "Course Outline Generator",
      description: "Generate a comprehensive course structure with chapters and lessons",
      icon: BookOpen
    },
    {
      id: "course-description",
      name: "Course Description Writer",
      description: "Create compelling course descriptions that attract students",
      icon: FileText
    },
    {
      id: "thumbnail-generator",
      name: "Course Thumbnail Creator",
      description: "Generate eye-catching thumbnails for your courses",
      icon: Image
    },
    {
      id: "quiz-generator",
      name: "Quiz & Assessment Builder",
      description: "Create quizzes and assessments to test student knowledge",
      icon: Video
    }
  ];

  const generateCourseOutline = async () => {
    const prompt = `Create a comprehensive course outline for a ${inputs.level} level course on "${inputs.topic}". 
    The course should be approximately ${inputs.duration} hours long and target ${inputs.audience || 'general learners'}.
    
    Additional context: ${inputs.additionalContext}
    
    Please structure the response as a detailed course outline with:
    1. Course title
    2. Course description (2-3 paragraphs)
    3. Learning objectives (5-7 points)
    4. Prerequisites
    5. Detailed curriculum with chapters and lessons
    6. Estimated time for each section
    
    Make it engaging and practical for ${inputs.audience || 'students'}.`;

    const response = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          learning_objectives: { type: "array", items: { type: "string" } },
          prerequisites: { type: "array", items: { type: "string" } },
          chapters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                duration_minutes: { type: "number" },
                lessons: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      duration_minutes: { type: "number" },
                      description: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          total_duration_hours: { type: "number" }
        }
      }
    });

    return response;
  };

  const generateCourseDescription = async () => {
    const prompt = `Write a compelling course description for a ${inputs.level} level course on "${inputs.topic}".
    The description should be marketing-focused and persuasive, targeting ${inputs.audience || 'learners'}.
    
    Style: ${inputs.style}
    Additional context: ${inputs.additionalContext}
    
    Include:
    - Hook opening paragraph
    - What students will learn (benefits-focused)
    - Who this course is for
    - Course structure overview
    - Call to action
    
    Make it engaging and conversion-optimized.`;

    const response = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          short_description: { type: "string" },
          long_description: { type: "string" },
          key_benefits: { type: "array", items: { type: "string" } },
          target_audience: { type: "array", items: { type: "string" } },
          course_highlights: { type: "array", items: { type: "string" } }
        }
      }
    });

    return response;
  };

  const generateThumbnail = async () => {
    const prompt = `Create a professional, modern course thumbnail for a ${inputs.level} level course on "${inputs.topic}".
    Style: ${inputs.style}, clean design, high contrast text, educational theme.
    Include course topic prominently, use professional colors (blues, greens, or purples).
    No people in the image, focus on abstract or symbolic representations of the topic.`;

    const response = await GenerateImage({ prompt });
    return { thumbnail_url: response.url, prompt_used: prompt };
  };

  const generateQuiz = async () => {
    const prompt = `Create a comprehensive quiz for a ${inputs.level} level course on "${inputs.topic}".
    Target audience: ${inputs.audience || 'general learners'}
    
    Generate:
    - 10 multiple choice questions (4 options each)
    - 5 true/false questions  
    - 3 short answer questions
    
    Questions should test both theoretical knowledge and practical application.
    Include explanations for correct answers.`;

    const response = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          multiple_choice: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct_answer: { type: "number" },
                explanation: { type: "string" }
              }
            }
          },
          true_false: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                correct_answer: { type: "boolean" },
                explanation: { type: "string" }
              }
            }
          },
          short_answer: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                sample_answer: { type: "string" },
                grading_criteria: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    return response;
  };

  const handleGenerate = async () => {
    if (!inputs.topic.trim()) return;

    setIsGenerating(true);
    try {
      let result;
      
      switch (selectedTool) {
        case "course-outline":
          result = await generateCourseOutline();
          break;
        case "course-description":
          result = await generateCourseDescription();
          break;
        case "thumbnail-generator":
          result = await generateThumbnail();
          break;
        case "quiz-generator":
          result = await generateQuiz();
          break;
        default:
          result = { error: "Unknown tool selected" };
      }
      
      setGeneratedContent(result);
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent({ error: "Failed to generate content. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const createCourseFromOutline = async () => {
    if (!generatedContent || selectedTool !== "course-outline") return;

    try {
      const courseData = {
        title: generatedContent.title,
        description: generatedContent.description,
        instructor_id: user.id,
        instructor_name: user.full_name,
        category: "other",
        level: inputs.level,
        duration: generatedContent.total_duration_hours * 60,
        chapters: generatedContent.chapters.map(chapter => ({
          title: chapter.title,
          lectures: chapter.lessons.map(lesson => ({
            title: lesson.title,
            video_url: "",
            duration: lesson.duration_minutes,
            is_preview_free: false
          }))
        })),
        is_published: false,
        price: 0
      };

      await Course.create(courseData);
      alert("Course outline created successfully! You can find it in your educator dashboard.");
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access AI tools
          </h2>
          <Button onClick={() => User.login()}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Content Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Leverage AI to create engaging course content, descriptions, and materials in minutes
          </p>
        </div>

        {/* Tool Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tools.map((tool) => (
            <Card 
              key={tool.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedTool === tool.id 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
              onClick={() => setSelectedTool(tool.id)}
            >
              <CardContent className="p-4 text-center">
                <tool.icon className={`w-8 h-8 mx-auto mb-2 ${
                  selectedTool === tool.id ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-500" />
                  Content Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic/Subject *
                  </label>
                  <Input
                    value={inputs.topic}
                    onChange={(e) => setInputs(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., React Development, Digital Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <Select value={inputs.level} onValueChange={(value) => setInputs(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedTool === "course-outline" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Duration (hours)
                    </label>
                    <Input
                      type="number"
                      value={inputs.duration}
                      onChange={(e) => setInputs(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="4"
                      min="1"
                      max="100"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <Input
                    value={inputs.audience}
                    onChange={(e) => setInputs(prev => ({ ...prev, audience: e.target.value }))}
                    placeholder="e.g., web developers, marketing professionals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Style/Tone
                  </label>
                  <Select value={inputs.style} onValueChange={(value) => setInputs(prev => ({ ...prev, style: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Context
                  </label>
                  <Textarea
                    value={inputs.additionalContext}
                    onChange={(e) => setInputs(prev => ({ ...prev, additionalContext: e.target.value }))}
                    placeholder="Any specific requirements, focus areas, or constraints..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!inputs.topic.trim() || isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedContent ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to Generate
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Fill in the parameters and click generate to create AI-powered content
                    </p>
                  </div>
                ) : generatedContent.error ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">Error generating content</div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {generatedContent.error}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Course Outline Results */}
                    {selectedTool === "course-outline" && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {generatedContent.title}
                          </h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(generatedContent, null, 2))}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                            <Button size="sm" onClick={createCourseFromOutline}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Create Course
                            </Button>
                          </div>
                        </div>
                        
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {generatedContent.description}
                          </p>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {generatedContent.learning_objectives?.map((obj, index) => (
                                  <li key={index} className="text-sm">{obj}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Prerequisites:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {generatedContent.prerequisites?.map((req, index) => (
                                  <li key={index} className="text-sm">{req}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-4">Course Curriculum:</h4>
                            {generatedContent.chapters?.map((chapter, chapterIndex) => (
                              <div key={chapterIndex} className="mb-4 border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-medium">Chapter {chapterIndex + 1}: {chapter.title}</h5>
                                  <Badge variant="outline">{chapter.duration_minutes} min</Badge>
                                </div>
                                <div className="ml-4 space-y-2">
                                  {chapter.lessons?.map((lesson, lessonIndex) => (
                                    <div key={lessonIndex} className="flex justify-between items-center text-sm">
                                      <span>{lesson.title}</span>
                                      <span className="text-gray-500">{lesson.duration_minutes} min</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Course Description Results */}
                    {selectedTool === "course-description" && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Description</h3>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent.long_description)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Short Description:</h4>
                            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                              {generatedContent.short_description}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Full Description:</h4>
                            <div className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded whitespace-pre-wrap">
                              {generatedContent.long_description}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Key Benefits:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {generatedContent.key_benefits?.map((benefit, index) => (
                                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{benefit}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Target Audience:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {generatedContent.target_audience?.map((audience, index) => (
                                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{audience}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Thumbnail Results */}
                    {selectedTool === "thumbnail-generator" && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generated Thumbnail</h3>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        
                        <div className="text-center">
                          <img 
                            src={generatedContent.thumbnail_url} 
                            alt="Generated thumbnail"
                            className="max-w-full h-auto rounded-lg shadow-lg mx-auto mb-4"
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Prompt used: {generatedContent.prompt_used}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quiz Results */}
                    {selectedTool === "quiz-generator" && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generated Quiz</h3>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(generatedContent, null, 2))}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy All
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Multiple Choice */}
                          <div>
                            <h4 className="font-semibold mb-3">Multiple Choice Questions:</h4>
                            {generatedContent.multiple_choice?.map((q, index) => (
                              <div key={index} className="mb-4 p-4 border rounded-lg">
                                <p className="font-medium mb-2">{index + 1}. {q.question}</p>
                                <div className="space-y-1 ml-4">
                                  {q.options?.map((option, optIndex) => (
                                    <div key={optIndex} className={`text-sm ${optIndex === q.correct_answer ? 'text-green-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                      {String.fromCharCode(65 + optIndex)}. {option}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-sm text-blue-600 mt-2">
                                  <strong>Explanation:</strong> {q.explanation}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* True/False */}
                          <div>
                            <h4 className="font-semibold mb-3">True/False Questions:</h4>
                            {generatedContent.true_false?.map((q, index) => (
                              <div key={index} className="mb-4 p-4 border rounded-lg">
                                <p className="font-medium mb-2">{index + 1}. {q.question}</p>
                                <p className="text-sm text-green-600">
                                  <strong>Answer:</strong> {q.correct_answer ? 'True' : 'False'}
                                </p>
                                <p className="text-sm text-blue-600 mt-2">
                                  <strong>Explanation:</strong> {q.explanation}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Short Answer */}
                          <div>
                            <h4 className="font-semibold mb-3">Short Answer Questions:</h4>
                            {generatedContent.short_answer?.map((q, index) => (
                              <div key={index} className="mb-4 p-4 border rounded-lg">
                                <p className="font-medium mb-2">{index + 1}. {q.question}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  <strong>Sample Answer:</strong> {q.sample_answer}
                                </p>
                                <div className="text-sm text-blue-600">
                                  <strong>Grading Criteria:</strong>
                                  <ul className="list-disc list-inside ml-2">
                                    {q.grading_criteria?.map((criteria, cIndex) => (
                                      <li key={cIndex}>{criteria}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}