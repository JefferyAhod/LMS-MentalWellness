import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify'; 
import { getMyCourses } from '../api/educator'; 


export const useFetchEducatorCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true); 
        setError(null);   
        try {
            const data = await getMyCourses();
            setCourses(data); 
        } catch (err) {
            console.error("Error in useFetchEducatorCourses:", err);
            setError(err); 
            toast.error(err.response?.data?.message || 'Failed to load your courses. Please try again.');
        } finally {
            setLoading(false); 
        }
    }, []); 

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]); 

    return { courses, loading, error, refetchCourses: fetchCourses };
};
