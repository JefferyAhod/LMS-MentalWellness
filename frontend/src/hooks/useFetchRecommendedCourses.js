import { useState, useEffect, useCallback } from 'react';
import { getRecommendedCourses } from '@/api/courses'; 

export const useFetchRecommendedCourses = (limit = 3) => {
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecommended = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getRecommendedCourses(limit);
            setRecommendedCourses(data);
        } catch (err) {
            setError(err);
            console.error("Failed to fetch recommended courses:", err);
            setRecommendedCourses([]);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchRecommended();
    }, [fetchRecommended]);

    return { recommendedCourses, isLoading, error, refetchRecommended: fetchRecommended };
};
