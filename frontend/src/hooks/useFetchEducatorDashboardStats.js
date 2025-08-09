// frontend/src/hooks/useFetchEducatorDashboardStats.js

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEducatorDashboardStats } from '../api/educator';

export const useFetchEducatorDashboardStats = () => {
 const { isAuthenticated, loading: authLoading, user } = useAuth();
 const [stats, setStats] = useState({
  totalCourses: 0,
  totalStudents: 0,
  totalRevenue: 0,
  avgRating: 0,
 });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
  const fetchStats = async () => {
   // Only fetch if authentication is complete, the user is authenticated,
   // and they have the 'educator' role.
   if (!authLoading && isAuthenticated && user?.role === 'educator') {
    setLoading(true);
    setError(null);
    try {
     const result = await getEducatorDashboardStats();
     setStats(result);
    } catch (err) {
     console.error("Failed to fetch educator dashboard stats:", err);
     setError(err.response?.data?.message || "Failed to load dashboard statistics.");
     setStats({
      totalCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      avgRating: 0,
     });
    } finally {
     setLoading(false);
    }
   } else if (!authLoading && (!isAuthenticated || user?.role !== 'educator')) {
        // If not authenticated or not an educator, simply stop loading and clear stats.
        setLoading(false);
        setStats({
          totalCourses: 0,
          totalStudents: 0,
          totalRevenue: 0,
          avgRating: 0,
        });
      }
  };

  fetchStats();
 }, [isAuthenticated, authLoading, user?.role]); // The useEffect now only depends on the core values

 return { stats, loading, error };
};
