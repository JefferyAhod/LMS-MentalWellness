import { useState, useEffect, useCallback } from 'react';
import { getLearningProgress, enrollInCourse, markLectureComplete } from '@/api/student';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export const useCourseProgress = (courseId, userId, courseChapters) => {
    // This is the source of truth from AuthContext
    const { isAuthenticated, user, loading: authLoading } = useAuth();

    const [enrollment, setEnrollment] = useState(null);
    const [completedLectures, setCompletedLectures] = useState([]);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [isCourseCompleted, setIsCourseCompleted] = useState(false);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true); // Loading state for progress operations
    const [error, setError] = useState(null);


    // Fetch initial enrollment and progress
    const fetchProgress = useCallback(async () => {
        if (authLoading) {
            setIsLoadingProgress(true); // Keep loading true if auth is still determining status
            return;
        }
        if (!isAuthenticated || !user?._id || !courseId) {
            console.warn("useCourseProgress: fetchProgress: Not authenticated or missing ID, setting loading false.");
            setIsLoadingProgress(false); // Only set false if we've decided we don't have a user/courseId
            setEnrollment(null); // Clear previous enrollment if conditions change
            setError(null); // Clear errors
            return;
        }

        setIsLoadingProgress(true);
        setError(null);
        try {
            const res = await getLearningProgress(courseId);
            setEnrollment(res);
            setCompletedLectures(res.completedLectures || []);
            setProgressPercentage(res.progress || 0);
            setIsCourseCompleted(res.isCompleted || false);
        } catch (err) {
            console.error("useCourseProgress: fetchProgress: Error fetching learning progress:", err);
            setError(err);
            setEnrollment(null);
            setCompletedLectures([]);
            setProgressPercentage(0);
            setIsCourseCompleted(false);
            toast.error(err.response?.data?.message || "Failed to load your course progress.");
        } finally {
            setIsLoadingProgress(false);
        }
    }, [isAuthenticated, user, courseId, authLoading]); // Dependencies for fetchProgress


    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]); // Depend on fetchProgress callback


    // Function to enroll in the course
    const enroll = useCallback(async (currentCourseId, coursePrice) => {
        // This is the core check that's failing
        if (!isAuthenticated || !user?._id) {
            toast.error("You must be logged in to enroll in a course.");
            console.warn("useCourseProgress: enroll: Failed - user not authenticated or user ID missing.");
            return false;
        }
        if (!currentCourseId) {
            toast.error("Course ID is missing for enrollment.");
            console.warn("useCourseProgress: enroll: Failed - course ID missing.");
            return false;
        }
        if (enrollment) {
            toast.info("You are already enrolled in this course.");
            console.info("useCourseProgress: enroll: Already enrolled, skipping.");
            return false;
        }

        setIsLoadingProgress(true);
        setError(null);
        try {
            const newEnrollment = await enrollInCourse(currentCourseId);
            setEnrollment(newEnrollment);
            setCompletedLectures(newEnrollment.completedLectures || []);
            setProgressPercentage(newEnrollment.progress || 0);
            setIsCourseCompleted(newEnrollment.isCompleted || false);
            toast.success("Successfully enrolled in the course!");
            return true;
        } catch (err) {
            console.error("useCourseProgress: enroll: Error enrolling in course:", err);
            setError(err);
            toast.error(err.response?.data?.message || "Failed to enroll in course.");
            return false;
        } finally {
            setIsLoadingProgress(false);
        }
    }, [isAuthenticated, user, enrollment, toast]); // Dependencies for enroll


    // Function to mark a lecture as complete
    const markLectureAsComplete = useCallback(async (lectureId, totalCourseChapters) => {
        if (!isAuthenticated || !user?._id || !enrollment) {
            toast.error("You must be logged in and enrolled to mark lectures complete.");
            console.warn("useCourseProgress: markLectureAsComplete: Failed - not authenticated or enrolled.");
            return false;
        }
        if (completedLectures.includes(lectureId)) {
            toast.info("This lecture is already marked complete.");
            console.info("useCourseProgress: markLectureAsComplete: Already complete, skipping.");
            return false;
        }

        setIsLoadingProgress(true);
        setError(null);
        try {
            const updatedEnrollment = await markLectureComplete(enrollment._id, lectureId);

            let totalLectures = 0;
            if (totalCourseChapters) {
                totalLectures = totalCourseChapters.reduce((sum, chapter) => sum + (chapter.lectures?.length || 0), 0);
            }

            const newCompletedCount = (updatedEnrollment.completedLectures || []).length;
            const newProgress = totalLectures > 0 ? (newCompletedCount / totalLectures) * 100 : 0;
            const newIsCompleted = newProgress >= 100 && totalLectures > 0;

            setEnrollment(updatedEnrollment);
            setCompletedLectures(updatedEnrollment.completedLectures || []);
            setProgressPercentage(newProgress);
            setIsCourseCompleted(newIsCompleted);

            toast.success("Lecture marked complete!");
            return true;
        } catch (err) {
            console.error("useCourseProgress: markLectureAsComplete: Error:", err);
            setError(err);
            toast.error(err.response?.data?.message || "Failed to mark lecture complete.");
            return false;
        } finally {
            setIsLoadingProgress(false);
        }
    }, [isAuthenticated, user, enrollment, completedLectures, toast]);

    const isLectureCompleted = useCallback((lectureId) => {
        return completedLectures.includes(lectureId);
    }, [completedLectures]);

    return {
        enrollment,
        completedLectures,
        progressPercentage,
        isCourseCompleted,
        isLoadingProgress,
        error,
        enroll,
        markLectureAsComplete,
        isLectureCompleted,
        refetchProgress: fetchProgress
    };
};
