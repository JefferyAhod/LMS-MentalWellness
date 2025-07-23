
import { useState, useEffect, useCallback } from 'react';
import { getCourses } from '@/api/courses'; 

export const useFetchCourses = (initialParams = {}) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: initialParams.page || 1,
        pages: 1,
        totalCourses: 0,
        limit: initialParams.limit || 10,
    });
    const [currentParams, setCurrentParams] = useState(initialParams);

    const fetchCourses = useCallback(async (params) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCourses(params); 
            setCourses(data.courses);
            setPagination({
                page: data.page,
                pages: data.pages,
                totalCourses: data.totalCourses,
                limit: params.limit || 10, 
            });
        } catch (err) {
            setError(err);
            console.error("Failed to fetch courses:", err);
            setCourses([]); 
            setPagination({ page: 1, pages: 1, totalCourses: 0, limit: params.limit || 10 });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses(currentParams);
    }, [currentParams, fetchCourses]); 

    // Function to update parameters and trigger a refetch
    const setParams = useCallback((newParams) => {
        setCurrentParams(prev => ({ ...prev, ...newParams }));
    }, []);

    return { courses, isLoading, error, pagination, setParams, refetch: () => fetchCourses(currentParams) };
};
