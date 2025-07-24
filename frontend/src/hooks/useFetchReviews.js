// frontend/src/hooks/useFetchReviews.js

import { useState, useEffect, useCallback } from 'react';
import { getReviewsForCourse } from '@/api/reviews'; // Import the API function

/**
 * Custom hook to fetch and manage reviews for a specific course.
 * @param {string} courseId - The ID of the course.
 * @returns {Object} - Contains reviews, loading state, error, and a refetch function.
 */
export const useFetchReviews = (courseId) => {
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [reviewsError, setReviewsError] = useState(null);

    const fetchReviews = useCallback(async () => {
        if (!courseId) {
            setReviews([]);
            setIsLoadingReviews(false);
            return;
        }

        setIsLoadingReviews(true);
        setReviewsError(null);
        try {
            const data = await getReviewsForCourse(courseId);
            setReviews(data);
        } catch (err) {
            setReviewsError(err);
            console.error(`Failed to fetch reviews for course ${courseId}:`, err);
            setReviews([]);
        } finally {
            setIsLoadingReviews(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { reviews, isLoadingReviews, reviewsError, refetchReviews: fetchReviews };
};
