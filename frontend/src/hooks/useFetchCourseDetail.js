import { useState, useEffect, useCallback } from 'react';
import { getCourseById } from '@/api/courses'; // Assuming this API function exists
import { toast } from 'react-toastify';

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
            console.warn("useFetchCourseDetail: No courseId provided, skipping fetch.");
            setIsLoading(false);
            setError(new Error("Course ID is required to fetch details."));
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await getCourseById(courseId);
            setCourse(data);
        } catch (err) {
            console.error("useFetchCourseDetail: Error fetching course:", err);
            setError(err);
            toast.error(err.response?.data?.message || `Failed to load course: ${courseId}.`);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]); // Dependency on courseId

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]); // Depend on fetchCourse callback

    return { course, isLoading, error, refetchCourse: fetchCourse };
};
