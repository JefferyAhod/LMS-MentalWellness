import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

// UI Components
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
    Loader2,
    AlertCircle,
    Lock
} from "lucide-react";

// Components
import VideoPlayer from "../../components/VideoPlayer";
import ReviewSection from "../../components/ReviewSection";
import CertificateModal from "../../components/CertificateModal";

// Custom Hooks
import { useAuth } from '@/context/AuthContext';
import { useFetchCourseDetail } from '@/hooks/useFetchCourseDetail';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { toast } from 'react-toastify'; // Ensure toast is imported here

export default function CourseDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const courseId = params.get("id");

    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const {
        course,
        isLoading: courseLoading,
        error: courseError,
        refetchCourse
    } = useFetchCourseDetail(courseId);

    const {
        enrollment,
        completedLectures,
        progressPercentage,
        isCourseCompleted,
        isLoadingProgress,
        enroll,
        markLectureAsComplete,
        isLectureCompleted
    } = useCourseProgress(courseId, user?._id, course?.chapters);

    const [currentVideo, setCurrentVideo] = useState(null);
    const [showCertificate, setShowCertificate] = useState(false);

    useEffect(() => {
        if (!courseId) {
            return;
        }
        refetchCourse();
    }, [courseId, refetchCourse]);

    const handleEnroll = useCallback(async () => {
        const success = await enroll(courseId, course?.price || 0);
        if (success && course.price > 0) {
            navigate(createPageUrl("PaymentPage", { courseId: courseId }));
        }
    }, [enroll, courseId, course?.price, navigate]);


    const handleLectureClick = useCallback((lecture) => {
        const isAccessible = enrollment || lecture.is_preview_free;
        if (isAccessible) {
            setCurrentVideo(lecture);
        } else {
            toast.info("Please enroll in the course to access this lecture.");
        }
    }, [enrollment]);


    const handleLectureComplete = useCallback(async (lectureId) => {
        const success = await markLectureAsComplete(lectureId, course?.chapters);
        if (success && isCourseCompleted) {
            setShowCertificate(true);
        }
    }, [markLectureAsComplete, isCourseCompleted, course?.chapters]);

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // --- Conditional Renderings for Loading/Error/Access ---
    if (!courseId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Course ID is missing from URL.
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please ensure you navigate to this page with a valid course ID in the URL (e.g., `/CourseDetail?id=YOUR_COURSE_ID`).
                    </p>
                    <Button onClick={() => navigate(createPageUrl("Home"))}>
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    if (authLoading || courseLoading || isLoadingProgress) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="ml-4 text-xl text-gray-700 dark:text-gray-300">Loading course details...</p>
            </div>
        );
    }

    if (courseError || !course) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Course not found or an error occurred.
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {courseError?.message || "The course you are looking for does not exist or could not be loaded."}
                    </p>
                    <Button onClick={() => navigate(createPageUrl("Home"))}>
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    // --- Main Course Detail Content ---
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
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {course.instructor_name?.[0]?.toUpperCase() || course.educator?.name?.[0]?.toUpperCase() || course.educator?.email?.[0]?.toUpperCase() || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {course.instructor_name || course.educator?.name || course.educator?.email || 'Unknown Instructor'}
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
                                        {course.average_rating || course.ratingsAverage || 0} rating
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

                        {/* Enrollment Card */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4 border-0 shadow-lg">
                                <CardHeader className="p-0">
                                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-t-lg overflow-hidden">
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
                                                    const firstLecture = course.chapters?.[0]?.lectures?.[0];
                                                    if (firstLecture) {
                                                        setCurrentVideo(firstLecture);
                                                    } else {
                                                        toast.info("No lectures found for this course.");
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
                                                // The hook itself will manage the loading state and prevent re-enroll
                                                // Text changes to "Enrolling..." via isLoadingProgress
                                            >
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                {isLoadingProgress ? 'Enrolling...' : 'Enroll Now'}
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
                    onComplete={() => handleLectureComplete(currentVideo._id)}
                    isCompleted={isLectureCompleted(currentVideo._id)}
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
                                    {course.chapters?.length > 0 ? (
                                        course.chapters.map((chapter, chapterIndex) => (
                                            <div key={chapter._id || chapterIndex} className="border rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {chapter.title}
                                                    </h3>
                                                </div>
                                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {chapter.lectures?.map((lecture) => {
                                                        const isAccessible = enrollment || lecture.is_preview_free;
                                                        const isCompleted = isLectureCompleted(lecture._id);

                                                        return (
                                                            <div
                                                                key={lecture._id}
                                                                className={`px-4 py-3 flex items-center justify-between ${
                                                                    isAccessible ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : 'cursor-not-allowed opacity-60'
                                                                }`}
                                                                onClick={() => {
                                                                    if (isAccessible) {
                                                                        setCurrentVideo(lecture);
                                                                    } else {
                                                                        toast.info("Please enroll in the course to access this lecture.");
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {isCompleted ? (
                                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                                    ) : isAccessible ? (
                                                                        <Play className="w-5 h-5 text-gray-400" />
                                                                    ) : (
                                                                        <Lock className="w-5 h-5 text-gray-400" />
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
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400 text-center py-8">No curriculum available for this course yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <ReviewSection
                            courseId={course._id}
                            userEnrollment={enrollment}
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
