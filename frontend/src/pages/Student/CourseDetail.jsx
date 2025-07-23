// frontend/pages/Course/CourseDetail.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

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

import VideoPlayer from "../../components/VideoPlayer"; // Ensure this path is correct
import ReviewSection from "../../components/ReviewSection";
import CertificateModal from "../../components/CertificateModal";

export default function CourseDetail() {
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentVideo, setCurrentVideo] = useState(null); // State to control VideoPlayer visibility
    const [showCertificate, setShowCertificate] = useState(false);

    // Define dummy data directly in the component
    const DUMMY_COURSE_DATA = {
        id: "mock-course-123",
        _id: "mock-course-123", // Use _id for consistency with MongoDB
        title: "Mastering React Hooks (Mock Data)",
        description: "This is a comprehensive mock course designed to help you understand and master React Hooks from basic to advanced concepts. Learn to build powerful and efficient React applications.",
        category: "Web Development",
        level: "Intermediate",
        thumbnail: "https://placehold.co/600x400/3498DB/FFFFFF?text=React+Hooks", // A different placeholder image
        instructor_name: "Dummy Instructor",
        duration: 240, // 4 hours
        total_enrollments: 5678,
        average_rating: 4.8,
        price: 129.99,
        chapters: [
            {
                title: "Chapter 1: Introduction to Hooks",
                lectures: [
                    { id: "lec1-1", title: "What are Hooks?", duration: 8, is_preview_free: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
                    { id: "lec1-2", title: "useState Hook", duration: 12, is_preview_free: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
                    { id: "lec1-3", title: "useEffect Hook Basics", duration: 15, is_preview_free: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }
                ]
            },
            {
                title: "Chapter 2: Advanced Hooks",
                lectures: [
                    { id: "lec2-1", title: "useContext for State Management", duration: 20, is_preview_free: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
                    { id: "lec2-2", title: "useReducer for Complex State", duration: 25, is_preview_free: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
                    { id: "lec2-3", title: "useCallback and useMemo for Performance", duration: 18, is_preview_free: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }
                ]
            },
            {
                title: "Chapter 3: Custom Hooks and Best Practices",
                lectures: [
                    { id: "lec3-1", title: "Building Your First Custom Hook", duration: 30, is_preview_free: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
                    { id: "lec3-2", title: "Testing Hooks", duration: 22, is_preview_free: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
                    { id: "lec3-3", title: "Hooks in Large Applications", duration: 25, is_preview_free: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" }
                ]
            }
        ]
    };

    const DUMMY_USER_DATA = {
        id: "mock-user-456",
        name: "Mock Student",
        email: "student@example.com",
        role: "student"
    };

    // Initial enrollment data, can be changed to null to simulate not enrolled
    const DUMMY_ENROLLMENT_DATA = {
        id: "mock-enroll-789",
        course_id: DUMMY_COURSE_DATA.id,
        student_id: DUMMY_USER_DATA.id,
        progress: 33.3, // Example progress
        completed_lectures: ["lec1-1", "lec1-2", "lec1-3", "lec2-1"], // Example completed lectures
        is_completed: false,
        completion_date: null
    };

    const DUMMY_REVIEWS_DATA = [
        { id: "rev1", course_id: DUMMY_COURSE_DATA.id, student_name: "Alice", rating: 5, comment: "Fantastic course! Very clear explanations.", date: "2023-01-15" },
        { id: "rev2", course_id: DUMMY_COURSE_DATA.id, student_name: "Bob", rating: 4, comment: "Good content, but a bit fast-paced at times.", date: "2023-02-01" }
    ];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const courseId = params.get("id");

        const timer = setTimeout(() => {
            if (courseId) {
                setCourse(DUMMY_COURSE_DATA);
                setUser(DUMMY_USER_DATA);
                // Set initial enrollment based on your testing needs:
                // For "Continue Learning" button: setEnrollment(DUMMY_ENROLLMENT_DATA);
                // For "Enroll Now" button: setEnrollment(null);
                setEnrollment(DUMMY_ENROLLMENT_DATA); // Currently set to enrolled
                setReviews(DUMMY_REVIEWS_DATA);
            }
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // loadCourseData is now effectively handled by the useEffect above
    const loadCourseData = (courseId) => {
        console.log(`Loading mock data for courseId: ${courseId}`);
        setCourse(DUMMY_COURSE_DATA);
        setUser(DUMMY_USER_DATA);
        setEnrollment(DUMMY_ENROLLMENT_DATA);
        setReviews(DUMMY_REVIEWS_DATA);
        setIsLoading(false);
    };

    const handleEnroll = () => {
        if (!user) {
            alert("Please log in to enroll in this course.");
            return;
        }

        if (enrollment) {
            alert("You are already enrolled.");
            return;
        }

        // Navigate to a mock checkout page
        navigate(createPageUrl("CheckoutPage", { courseId: course.id }));
    };

    const handleLectureComplete = (lectureId) => {
        if (!enrollment) {
            alert("You must be enrolled to complete lectures.");
            return;
        }

        const isAlreadyCompleted = enrollment.completed_lectures.includes(lectureId);
        if (isAlreadyCompleted) {
            alert("Lecture already completed.");
            return;
        }

        const updatedCompletedLectures = [...(enrollment.completed_lectures || []), lectureId];
        const totalLectures = course.chapters.reduce((sum, chapter) => sum + (chapter.lectures?.length || 0), 0);
        const newProgress = (updatedCompletedLectures.length / totalLectures) * 100;
        const isCompleted = newProgress >= 100;

        const updatedEnrollment = {
            ...enrollment,
            completed_lectures: updatedCompletedLectures,
            progress: newProgress,
            is_completed: isCompleted,
            completion_date: isCompleted ? new Date().toISOString() : null
        };

        setEnrollment(updatedEnrollment);

        if (isCompleted) {
            setShowCertificate(true);
            alert("Course completed! View your certificate.");
        } else {
            alert(`Lecture ${lectureId} completed! Progress: ${Math.round(newProgress)}%`);
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
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/cccccc/333333?text=No+Img'; }}
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
                                                onClick={() => {
                                                    console.log("Setting current video to:", course.chapters[0]?.lectures[0]);
                                                    setCurrentVideo(course.chapters[0]?.lectures[0]);
                                                }}
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
                    onClose={() => {
                        console.log("Closing video player.");
                        setCurrentVideo(null);
                    }}
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
                                                                console.log("Setting current video to:", lecture);
                                                                setCurrentVideo(lecture);
                                                            } else {
                                                                alert("Please enroll in the course to access this lecture.");
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
