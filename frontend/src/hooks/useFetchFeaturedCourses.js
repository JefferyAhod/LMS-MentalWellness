import { useState, useEffect, useCallback } from 'react';
import { getFeaturedCourses } from '@/api/courses'; 

export const useFetchFeaturedCourses = (limit = 3) => {
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFeatured = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getFeaturedCourses(limit);
            setFeaturedCourses(data);
        } catch (err) {
            setError(err);
            console.error("Failed to fetch featured courses:", err);
            setFeaturedCourses([]);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchFeatured();
    }, [fetchFeatured]);

    return { featuredCourses, isLoading, error, refetchFeatured: fetchFeatured };
};
