// frontend/src/hooks/useAdminData.js

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get authenticated user (admin) details
import { toast } from 'react-toastify'; // For displaying notifications

// Import all the API functions from your admin service
import {
    getAllUsers as getAllUsersAdmin, // Renamed to avoid conflict if you have other getAllUsers
    getAllCourses as getAllCoursesAdmin, // Renamed
    updateUserRoleAdmin as updateUserRoleAPI, // Renamed for clarity in hook
    toggleCourseStatusAdmin as toggleCourseStatusAPI,
    getDashboardStats as getAdminDashboardStatsAPI, 
    deleteUser as deleteUserAPI, 
    deleteCourse as deleteCourseAPI
} from '../api/admin';

export const useAdminData = () => {
    const { user: authUser, loading: authLoading, isAuthenticated } = useAuth(); // Get current authenticated user details
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        educators: 0,
        pendingEducators: 0,
        totalCourses: 0,
        publishedCourses: 0, // This will be calculated from courses
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoized function to fetch all necessary admin data
    const fetchAllAdminData = useCallback(async () => {
        // Only attempt to fetch if authentication is loaded, user is authenticated, and is an admin
        if (authLoading || !isAuthenticated || authUser?.role !== 'admin') {
            setLoading(false);
            return; // Exit if not authorized or still loading auth
        }

        setLoading(true);
        setError(null);
        try {
            // Fetch all data concurrently for efficiency
            const [usersData, coursesData, statsData] = await Promise.all([
                getAllUsersAdmin(),
                getAllCoursesAdmin(),
                getAdminDashboardStatsAPI()
            ]);

            setUsers(usersData);
            setCourses(coursesData);
            setStats({
                ...statsData,
                // Calculate publishedCourses directly from the fetched coursesData
                publishedCourses: coursesData.filter(c => c.is_published).length,
            });
            
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
            setError(err.response?.data?.message || "Failed to load admin panel data.");
            toast.error(err.response?.data?.message || "Failed to load admin panel data.");
            // Reset states on error
            setUsers([]);
            setCourses([]);
            setStats({ totalUsers: 0, students: 0, educators: 0, pendingEducators: 0, totalCourses: 0, publishedCourses: 0 });
        } finally {
            setLoading(false);
        }
    }, [authLoading, isAuthenticated, authUser?.role]); // Dependencies for useCallback

    // useEffect to call the data fetching function on component mount or relevant auth changes
    useEffect(() => {
        fetchAllAdminData();
    }, [fetchAllAdminData]); // Depend on the memoized fetchAllAdminData function

    // Admin action functions (wrapped in useCallback for stability)

    const toggleUserRole = useCallback(async (userId, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'student' : 'admin'; // Example toggle logic
            const response = await updateUserRoleAPI(userId, newRole);
            toast.success(response.message || `User role updated to ${newRole}.`);
            
            // Update local state to reflect the change immediately
            setUsers(prevUsers => prevUsers.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
            // Also refetch stats if roles affect stat counts (e.g., admin count changes)
            await getAdminDashboardStatsAPI().then(statsData => {
                setStats(prev => ({
                    ...statsData,
                    publishedCourses: courses.filter(c => c.is_published).length // Recalculate published courses based on current courses state
                }));
            });

        } catch (err) {
            setError(err.message || "Failed to update user role.");
            toast.error(err.response?.data?.message || "Failed to update user role.");
            console.error("Error toggling user role:", err);
        }
    }, [courses]); // courses is a dependency here because publishedCourses calculation relies on it

    const toggleCourseStatus = useCallback(async (courseId, currentStatus) => {
        try {
            const newStatus = !currentStatus; // true to publish, false to unpublish
            const response = await toggleCourseStatusAPI(courseId, newStatus);
            toast.success(response.message || `Course status updated to ${newStatus ? 'Published' : 'Draft'}.`);
            
            // Update local state
            setCourses(prevCourses => {
                const updatedCourses = prevCourses.map(course => 
                    course._id === courseId ? { ...course, is_published: newStatus } : course
                );
                // Recalculate publishedCourses based on the updated course list
                setStats(prevStats => ({
                    ...prevStats,
                    publishedCourses: updatedCourses.filter(c => c.is_published).length
                }));
                return updatedCourses;
            });

        } catch (err) {
            setError(err.message || "Failed to toggle course status.");
            toast.error(err.response?.data?.message || "Failed to toggle course status.");
            console.error("Error toggling course status:", err);
        }
    }, []);

    const deleteUser = useCallback(async (userId) => {
        // Using window.confirm for simplicity, consider a custom modal for better UX
        if (window.confirm("Are you sure you want to delete this user permanently? This action cannot be undone.")) {
            try {
                const response = await deleteUserAPI(userId);
                toast.success(response.message || "User deleted successfully.");
                // Remove the user from local state
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                // Update stats immediately
                setStats(prevStats => ({ ...prevStats, totalUsers: prevStats.totalUsers - 1 }));
            } catch (err) {
                setError(err.message || "Failed to delete user.");
                toast.error(err.response?.data?.message || "Failed to delete user.");
                console.error("Error deleting user:", err);
            }
        }
    }, []);

    const deleteCourse = useCallback(async (courseId) => {
        if (window.confirm("Are you sure you want to delete this course permanently? All associated data will be lost.")) {
            try {
                const response = await deleteCourseAPI(courseId);
                toast.success(response.message || "Course deleted successfully.");
                // Remove the course from local state
                setCourses(prevCourses => {
                    const updatedCourses = prevCourses.filter(course => course._id !== courseId);
                    // Update stats immediately
                    setStats(prevStats => ({
                        ...prevStats,
                        totalCourses: prevStats.totalCourses - 1,
                        publishedCourses: updatedCourses.filter(c => c.is_published).length // Recalculate
                    }));
                    return updatedCourses;
                });
            } catch (err) {
                setError(err.message || "Failed to delete course.");
                toast.error(err.response?.data?.message || "Failed to delete course.");
                console.error("Error deleting course:", err);
            }
        }
    }, []);

    return {
        users,
        courses,
        stats,
        loading,
        error,
        currentUser: authUser, 
        fetchAllAdminData, 
        toggleUserRole,
        toggleCourseStatus,
        deleteUser,
        deleteCourse
    };
};
