// frontend/src/hooks/useFetchStudentDashboard.js

import { useState, useEffect, useCallback } from 'react';
import { getStudentProfile, fetchEnrolledCourses } from '@/api/student'; // Import new API functions
import { useAuth } from '@/context/AuthContext'; // To check authentication status

/**
 * Custom hook to fetch all data required for the student dashboard.
 * Fetches user profile and their enrolled courses.
 * @returns {Object} - Contains user, enrollments (with populated course data), loading state, and error.
 */
export const useFetchStudentDashboard = () => {
    const { user: authUser, isAuthenticated, loading: authLoading } = useAuth(); // Get user from AuthContext
    const [userProfile, setUserProfile] = useState(null);
    const [enrollments, setEnrollments] = useState([]); // These enrollments will have course data populated
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboardData = useCallback(async () => {
        if (!isAuthenticated || authLoading) {
            // If not authenticated or still loading auth, don't fetch dashboard data yet
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Fetch student profile
            const profileData = await getStudentProfile();
            setUserProfile(profileData);

            // Fetch enrollments, which should now include populated course details
            const enrollmentsData = await fetchEnrolledCourses();
            setEnrollments(enrollmentsData);

        } catch (err) {
            console.error("Error loading dashboard data:", err);
            setError(err);
            setUserProfile(null);
            setEnrollments([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        // Only trigger data load once authentication status is determined
        if (!authLoading) {
            loadDashboardData();
        }
    }, [authLoading, loadDashboardData]);

    // Helper functions to derive data from enrollments
    const getEnrolledCoursesWithDetails = useCallback(() => {
        // Each enrollment object already contains the 'course' object due to populate
        return enrollments.map(enrollment => ({
            ...enrollment.course, // Spread course details
            enrollment: { // Add enrollment specific details
                _id: enrollment._id,
                progress: enrollment.progress,
                isCompleted: enrollment.isCompleted,
                enrolledAt: enrollment.enrolledAt,
                completedLectures: enrollment.completedLectures // Include completed lectures
            }
        }));
    }, [enrollments]);

    const getCompletedCoursesCount = useCallback(() => {
        return enrollments.filter(e => e.isCompleted).length;
    }, [enrollments]);

    const getTotalLearningHours = useCallback(() => {
        const totalMinutes = enrollments.reduce((sum, enrollment) => {
            // Ensure enrollment.course exists and has a duration
            return sum + (enrollment.course?.duration || 0);
        }, 0);
        return Math.round(totalMinutes / 60); // Convert to hours
    }, [enrollments]);

    const getAverageOverallProgress = useCallback(() => {
        if (enrollments.length === 0) return 0;
        const totalProgressSum = enrollments.reduce((sum, e) => sum + e.progress, 0);
        return Math.round(totalProgressSum / enrollments.length);
    }, [enrollments]);


    return {
        user: userProfile, // Renamed to userProfile to avoid confusion with authUser
        enrollments,
        enrolledCourses: getEnrolledCoursesWithDetails(), // Return formatted courses
        completedCoursesCount: getCompletedCoursesCount(),
        totalLearningHours: getTotalLearningHours(),
        averageOverallProgress: getAverageOverallProgress(),
        isLoading,
        error,
        refetchDashboard: loadDashboardData // Allow refetching all dashboard data
    };
};
