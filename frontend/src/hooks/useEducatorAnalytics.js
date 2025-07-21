import { useState, useEffect, useCallback } from 'react';
import { getEducatorAnalytics } from '../api/educator'; 
import { toast } from 'react-toastify';

export const useEducatorAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalyticsData = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            const result = await getEducatorAnalytics();
            setData(result);
        } catch (err) {
            console.error("Failed to fetch educator analytics:", err);
            setError(err);
            toast.error(err.response?.data?.message || "Failed to load analytics data.");
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]); 

    return { data, loading, error, refetch: fetchAnalyticsData };
};
