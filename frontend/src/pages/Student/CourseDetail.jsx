// frontend/pages/Course/CourseDetail.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Changed useParams to useLocation
import { createPageUrl } from "@/utils"; // Utility for creating page URLs
import { toast } from 'react-toastify'; // For user feedback

// UI Components from Shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Lucide React Icons
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
    Share2,
    Loader2 // Added Loader2 for loading spinner
} from "lucide-react";

// Custom Components
import VideoPlayer from "../../components/VideoPlayer"; // Ensure this path is correct
import ReviewSection from "../../components/ReviewSection"; // This component will need its own data fetching
import CertificateModal from "../../components/CertificateModal"; // Modal for certificate display

// Custom Hooks for data fetching and state management
import { useFetchCourseDetail } from '../../hooks/useFetchCourseDetail'; // Fetches single course data
import { useCourseProgress } from '../../hooks/useCourseProgress';     // Manages enrollment and lecture progress
import { useAuth } from '@/context/AuthContext';                       // Provides user authentication status

export default function CourseDetail() {
    const navigate = useNavigate();
    const location = useLocation(); // Use useLocation hook
    const params = new URLSearchParams(location.search);
    const courseId = params.get("id"); // Extract courseId from query parameter

    // Get user authentication status from AuthContext
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    // Conditionally call hooks only if courseId is available
    // The hooks themselves also have internal checks for courseId, but this prevents
    // them from even starting if the ID is missing from the URL.
    const {
        course,
        isLoading: isCourseLoading,
        error: courseError,
        refetchCourse
    } = useFetchCourseDetail(courseId);

    const {
        enrollment,
        completedLectures,
        progressPercentage,
        isCourseCompleted,
        isLoadingProgress,
        error: progressError,
        enroll,
        markLectureAsComplete,
        isLectureCompleted,
        refetchProgress
    } = useCourseProgress(courseId);

    const [currentVideo, setCurrentVideo] = useState(null);
    const [showCertificate, setShowCertificate] = useState(false);

    // Calculate total number of lectures in the course for progress calculation
    const totalLecturesInCourse = course?.chapters?.reduce((sum, chapter) => sum + (chapter.lectures?.length || 0), 0) || 0;

    // --- Event Handlers ---

    // Handles the "Enroll Now" button click
    const handleEnroll = async () => {
        await enroll();
    };

    // Handles marking a lecture as complete (called from VideoPlayer)
    const handleLectureComplete = async (lectureId) => {
        await markLectureAsComplete(lectureId, totalLecturesInCourse);
    };

    // Handles playing a lecture video
    const handlePlayLecture = (lecture) => {
        if (enrollment || lecture.is_preview_free) {
            setCurrentVideo(lecture);
        } else {
            toast.error("Please enroll in the course to access this lecture.");
        }
    };

    // --- Utility Functions ---

    // Formats duration from minutes to "Xh Ym"
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // --- Conditional Rendering for Loading/Error States ---

    // Determine overall loading state for the entire page
    const overallLoading = isCourseLoading || isLoadingProgress || authLoading;
    const overallError = courseError || progressError;

    // First, check if courseId is missing from the URL
    if (!courseId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Course ID is missing from URL.
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please ensure you navigate to this page with a valid course ID in the URL (e.g., /CourseDetail?id=YOUR_COURSE_ID).
                    </p>
                    <Link to={createPageUrl("CoursesPage")}>
                        <Button>Back to Courses</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Show a full-page spinner while any data is loading
    if (overallLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    // Handle case where course data is not found or there's an error after loading
    if (overallError || !course) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {overallError ? `Error: ${overallError.message}` : "Course not found"}
                    </h2>
                    <Link to={createPageUrl("CoursesPage")}>
                        <Button>Back to Courses</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // --- Main Component Render (when data is loaded and no errors) ---
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header Section */}
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
                        {/* Course Information Column (Left/Main) */}
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

                            {/* Course Stats (Instructor, Duration, Students, Rating) */}
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
                                        {course.ratingsAverage || 0} rating
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
                                            {Math.round(progressPercentage)}%
                                        </span>
                                    </div>
                                    <Progress value={progressPercentage} className="h-2" />
                                    {isCourseCompleted && (
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

                        {/* Enrollment Card Column (Right/Sidebar) */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4 border-0 shadow-lg">
                                <CardHeader className="p-0">
                                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-t-lg">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-full h-full object-cover rounded-t-lg"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/cccccc/333333?text=No+Img'; }}
                                            />
                                        ) : (
                                            <Play className="w-12 h-12 text-white opacity-70" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                            {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Lifetime access
                                        </p>
                                    </div>

                                    {/* Conditional buttons based on enrollment status */}
                                    {enrollment ? (
                                        <div className="space-y-3">
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    // Play the first lecture if enrolled and available
                                                    if (course.chapters && course.chapters.length > 0 && course.chapters[0].lectures.length > 0) {
                                                        handlePlayLecture(course.chapters[0].lectures[0]);
                                                    } else {
                                                        toast.info("No lectures found in this course yet.");
                                                    }
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
                                                disabled={isLoadingProgress || !isAuthenticated}
                                            >
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                {isLoadingProgress ? 'Enrolling...' : (course.price === 0 ? 'Enroll Free' : 'Enroll Now')}
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

            {/* Video Player Modal */}
            {currentVideo && (
                <VideoPlayer
                    video={currentVideo}
                    onClose={() => {
                        setCurrentVideo(null);
                        refetchProgress();
                    }}
                    onComplete={() => handleLectureComplete(currentVideo._id)}
                    isCompleted={isLectureCompleted(currentVideo._id)}
                />
            )}

            {/* Course Content Section (Curriculum and Reviews) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Course Curriculum Column */}
                    <div className="lg:col-span-2">
                        <Card className="mb-8 border-0">
                            <CardHeader>
                                <CardTitle>Course Curriculum</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {course.chapters?.map((chapter) => (
                                        <div key={chapter._id} className="border rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {chapter.title}
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {chapter.lectures?.map((lecture) => (
                                                    <div
                                                        key={lecture._id}
                                                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                                        onClick={() => handlePlayLecture(lecture)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {isLectureCompleted(lecture._id) ? (
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

                        {/* Reviews Section */}
                        <ReviewSection
                            courseId={courseId}
                            userEnrollment={enrollment}
                        />
                    </div>

                    {/* Sidebar Column (Course Includes) */}
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
            {showCertificate && isCourseCompleted && (
                <CertificateModal
                    course={course}
                    user={user}
                    onClose={() => setShowCertificate(false)}
                />
            )}
        </div>
    );
}
