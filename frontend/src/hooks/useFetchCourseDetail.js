// frontend/src/hooks/useFetchCourseDetail.js

import { useState, useEffect, useCallback } from 'react';
import { getCourseById } from '@/api/courses'; // Import the getCourseById API function

/**
 * Custom hook to fetch a single course's details.
 * @param {string} courseId - The ID of the course to fetch.
 * @returns {Object} - Contains course data, loading state, and error.
 */
export const useFetchCourseDetail = (courseId) => {
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCourse = useCallback(async () => {
        if (!courseId) {
            setError(new Error("Course ID is required."));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await getCourseById(courseId);
            setCourse(data);
        } catch (err) {
            setError(err);
            console.error(`Failed to fetch course ${courseId} details:`, err);
            setCourse(null);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    return { course, isLoading, error, refetchCourse: fetchCourse };
};
