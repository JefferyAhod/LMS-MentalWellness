// frontend/src/hooks/useCourseProgress.js

import { useState, useEffect, useCallback } from 'react';
import { getLearningProgress, enrollInCourse, markLectureComplete } from '@/api/student'; // Assuming these API functions exist in student.js
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext'; // Assuming you have an AuthContext

/**
 * Custom hook to manage student enrollment and course progress.
 * @param {string} courseId - The ID of the course.
 * @returns {Object} - Contains enrollment, progress, completion status, and functions to interact with progress.
 */
export const useCourseProgress = (courseId) => {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const [enrollment, setEnrollment] = useState(null); // Stores the full enrollment object
    const [completedLectures, setCompletedLectures] = useState([]); // Array of lecture IDs
    const [progressPercentage, setProgressPercentage] = useState(0); // Overall course progress
    const [isCourseCompleted, setIsCourseCompleted] = useState(false);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [error, setError] = useState(null);

    // Fetch initial enrollment and progress
    const fetchProgress = useCallback(async () => {
        if (!isAuthenticated || !user?._id || !courseId) {
            setIsLoadingProgress(false);
            return; // Cannot fetch progress without authenticated user or courseId
        }

        setIsLoadingProgress(true);
        setError(null);
        try {
            // getLearningProgress should return the enrollment object,
            // including a list of completed lectures (e.g., enrollment.completedLectures)
            const res = await getLearningProgress(courseId);
            setEnrollment(res);
            setCompletedLectures(res.completedLectures || []);
            setProgressPercentage(res.progress || 0);
            setIsCourseCompleted(res.isCompleted || false); // Assuming your enrollment model has an isCompleted flag
        } catch (err) {
            console.error("Error fetching learning progress:", err);
            setError(err);
            setEnrollment(null);
            setCompletedLectures([]);
            setProgressPercentage(0);
            setIsCourseCompleted(false);
        } finally {
            setIsLoadingProgress(false);
        }
    }, [isAuthenticated, user, courseId]);

    useEffect(() => {
        // Fetch progress only after auth status is known and user is authenticated
        if (!authLoading) {
            fetchProgress();
        }
    }, [authLoading, fetchProgress]);

    // Function to enroll in the course
    const enroll = useCallback(async () => {
        if (!isAuthenticated || !user?._id) {
            toast.error("You must be logged in to enroll in a course.");
            return;
        }
        if (!courseId) {
            toast.error("Course ID is missing for enrollment.");
            return;
        }
        if (enrollment) {
            toast.info("You are already enrolled in this course.");
            return;
        }

        setIsLoadingProgress(true);
        setError(null);
        try {
            const newEnrollment = await enrollInCourse(courseId);
            setEnrollment(newEnrollment);
            setCompletedLectures(newEnrollment.completedLectures || []);
            setProgressPercentage(newEnrollment.progress || 0);
            setIsCourseCompleted(newEnrollment.isCompleted || false);
            toast.success("Successfully enrolled in the course!");
        } catch (err) {
            console.error("Error enrolling in course:", err);
            setError(err);
            toast.error(err.response?.data?.message || "Failed to enroll in course.");
        } finally {
            setIsLoadingProgress(false);
        }
    }, [isAuthenticated, user, courseId, enrollment]);

    // Function to mark a lecture as complete
    // lectureId: The unique ID of the lecture
    // totalLecturesInCourse: Total count of lectures in the entire course (needed to calculate overall progress)
    const markLectureAsComplete = useCallback(async (lectureId, totalLecturesInCourse) => {
        if (!isAuthenticated || !user?._id || !enrollment) {
            toast.error("You must be logged in and enrolled to mark lectures complete.");
            return;
        }
        if (completedLectures.includes(lectureId)) {
            toast.info("This lecture is already marked complete.");
            return;
        }

        setIsLoadingProgress(true);
        setError(null);
        try {
            // Call backend to mark lecture complete and get updated enrollment/progress
            const updatedEnrollment = await markLectureComplete(enrollment._id, lectureId);

            setEnrollment(updatedEnrollment);
            setCompletedLectures(updatedEnrollment.completedLectures || []);
            setProgressPercentage(updatedEnrollment.progress || 0);
            setIsCourseCompleted(updatedEnrollment.isCompleted || false);

            toast.success("Lecture marked complete!");
        } catch (err) {
            console.error("Error marking lecture complete:", err);
            setError(err);
            toast.error(err.response?.data?.message || "Failed to mark lecture complete.");
        } finally {
            setIsLoadingProgress(false);
        }
    }, [isAuthenticated, user, enrollment, completedLectures]);

    // Helper to check if a specific lecture is completed
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
        refetchProgress: fetchProgress // Allow refetching progress from outside
    };
};
