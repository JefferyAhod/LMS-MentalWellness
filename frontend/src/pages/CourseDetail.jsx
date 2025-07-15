
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Course } from "@/entities/Course";
import { Enrollment } from "@/entities/Enrollment";
import { Review } from "@/entities/Review";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Award, 
  BookOpen,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  Heart,
  Share2
} from "lucide-react";

import VideoPlayer from "../components/VideoPlayer";
import ReviewSection from "../components/ReviewSection";
import CertificateModal from "../components/CertificateModal";

export default function CourseDetail() {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("id");
    if (courseId) {
      loadCourseData(courseId);
    }
  }, []);

  const loadCourseData = async (courseId) => {
    try {
      const [courseData, userData] = await Promise.all([
        Course.get(courseId),
        User.me().catch(() => null)
      ]);

      setCourse(courseData);
      setUser(userData);

      if (userData) {
        const [enrollmentData, reviewsData] = await Promise.all([
          Enrollment.filter({ course_id: courseId, student_id: userData.id }).then(res => res[0] || null),
          Review.filter({ course_id: courseId })
        ]);

        setEnrollment(enrollmentData);
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      await User.login();
      return;
    }

    try {
      const newEnrollment = await Enrollment.create({
        course_id: course.id,
        student_id: user.id,
        progress: 0,
        completed_lectures: []
      });

      setEnrollment(newEnrollment);

      // Update course enrollment count
      await Course.update(course.id, {
        total_enrollments: (course.total_enrollments || 0) + 1
      });

      setCourse(prev => ({
        ...prev,
        total_enrollments: (prev.total_enrollments || 0) + 1
      }));
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  const handleLectureComplete = async (lectureId) => {
    if (!enrollment) return;

    const updatedCompletedLectures = [...(enrollment.completed_lectures || []), lectureId];
    const totalLectures = course.chapters.reduce((sum, chapter) => sum + chapter.lectures.length, 0);
    const newProgress = (updatedCompletedLectures.length / totalLectures) * 100;
    const isCompleted = newProgress >= 100;

    const updatedEnrollment = await Enrollment.update(enrollment.id, {
      completed_lectures: updatedCompletedLectures,
      progress: newProgress,
      is_completed: isCompleted,
      completion_date: isCompleted ? new Date().toISOString() : null
    });

    setEnrollment(updatedEnrollment);

    if (isCompleted) {
      setShowCertificate(true);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course not found
          </h2>
          <Link to={createPageUrl("Home")}>
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">
                  {(course.category || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {course.title}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {course.description}
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {course.instructor_name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {course.instructor_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Instructor
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(course.duration || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.total_enrollments || 0} students
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {course.average_rating || 0} rating
                  </div>
                </div>
              </div>

              {enrollment && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      Your Progress
                    </span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      {Math.round(enrollment.progress)}%
                    </span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                  {enrollment.is_completed && (
                    <div className="flex items-center gap-2 mt-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Course completed! 
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setShowCertificate(true)}
                        className="text-green-600 p-0 h-auto"
                      >
                        View Certificate
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 border-0 shadow-lg">
                <CardHeader className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-t-lg">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <Play className="w-12 h-12 text-white opacity-70" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Lifetime access
                    </p>
                  </div>

                  {enrollment ? (
                    <div className="space-y-3">
                      <Button 
                        className="w-full"
                        onClick={() => setCurrentVideo(course.chapters[0]?.lectures[0])}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Heart className="w-4 h-4 mr-2" />
                        Add to Wishlist
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        className="w-full"
                        onClick={handleEnroll}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Enroll Now
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Course
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      {currentVideo && (
        <VideoPlayer
          video={currentVideo}
          onClose={() => setCurrentVideo(null)}
          onComplete={() => handleLectureComplete(currentVideo.id)}
          isCompleted={enrollment?.completed_lectures?.includes(currentVideo.id)}
        />
      )}

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Curriculum */}
          <div className="lg:col-span-2">
            <Card className="mb-8 border-0">
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.chapters?.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {chapter.title}
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {chapter.lectures?.map((lecture, lectureIndex) => (
                          <div 
                            key={lectureIndex}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => {
                              if (enrollment || lecture.is_preview_free) {
                                setCurrentVideo(lecture);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {enrollment?.completed_lectures?.includes(lecture.id) ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Play className="w-5 h-5 text-gray-400" />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {lecture.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(lecture.duration || 0)}
                                    {lecture.is_preview_free && (
                                      <Badge variant="outline" className="text-xs">
                                        Preview
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <ReviewSection 
              courseId={course.id} 
              reviews={reviews}
              userEnrollment={enrollment}
              onReviewAdded={(newReview) => setReviews([...reviews, newReview])}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6 border-0">
              <CardHeader>
                <CardTitle>Course Includes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(course.duration || 0)} on-demand video
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {course.chapters?.length || 0} chapters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Certificate of completion
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Access to community
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && enrollment?.is_completed && (
        <CertificateModal
          course={course}
          user={user}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}
