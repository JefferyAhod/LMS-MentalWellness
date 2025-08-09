// frontend/src/hooks/useAdminData.js

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Import all the API functions from your admin service
import {
    getAllUsers as getAllUsersAdmin,
    getAllCourses as getAllCoursesAdmin,
    updateUserRole as updateUserRoleAPI,
    toggleCourseStatus as toggleCourseStatusAPI,
    getAdminDashboardStats as getAdminDashboardStatsAPI,
    deleteUser as deleteUserAPI,
    deleteCourse as deleteCourseAPI
} from '../api/admin';

export const useAdminData = () => {
    const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        educators: 0,
        pendingEducators: 0,
        totalCourses: 0,
        publishedCourses: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllAdminData = useCallback(async () => {
        if (authLoading || !isAuthenticated || authUser?.role !== 'admin') {
            setLoading(false);
            if (!isAuthenticated) setError("Authentication required.");
            else if (authUser?.role !== 'admin') setError("You do not have admin privileges.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [usersData, coursesData, statsData] = await Promise.all([
                getAllUsersAdmin(),
                getAllCoursesAdmin(),
                getAdminDashboardStatsAPI()
            ]);

            setUsers(usersData);
            setCourses(coursesData);
            setStats({
                ...statsData,
                // --- FIX 1: Filter by explicit string 'published' ---
                publishedCourses: coursesData.filter(c => c.status === 'published').length,
            });
            
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
            setError(err.response?.data?.message || "Failed to load admin panel data.");
            toast.error(err.response?.data?.message || "Failed to load admin panel data.");
            setUsers([]);
            setCourses([]);
            setStats({ totalUsers: 0, students: 0, educators: 0, pendingEducators: 0, totalCourses: 0, publishedCourses: 0 });
        } finally {
            setLoading(false);
        }
    }, [authLoading, isAuthenticated, authUser?.role]);

    useEffect(() => {
        fetchAllAdminData();
    }, [fetchAllAdminData]);

    const toggleUserRole = useCallback(async (userId, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'student' : 'admin';
            const response = await updateUserRoleAPI(userId, newRole);
            toast.success(response.message || `User role updated to ${newRole}.`);
            
            setUsers(prevUsers => prevUsers.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
            await getAdminDashboardStatsAPI().then(statsData => {
                setStats(prev => ({
                    ...statsData,
                    // --- FIX 2: Filter by explicit string 'published' ---
                    publishedCourses: courses.filter(c => c.status === 'published').length
                }));
            });

        } catch (err) {
            setError(err.message || "Failed to update user role.");
            toast.error(err.response?.data?.message || "Failed to update user role.");
            console.error("Error toggling user role:", err);
        }
    }, [courses]);

    const toggleCourseStatus = useCallback(async (courseId, nextStatusString) => {
        try {
            const response = await toggleCourseStatusAPI(courseId, nextStatusString); 
            toast.success(response.message || `Course status updated to ${nextStatusString}.`);
            
            setCourses(prevCourses => {
                const updatedCourses = prevCourses.map(course => 
                    course._id === courseId ? { ...course, status: nextStatusString } : course
                );
                setStats(prevStats => ({
                    ...prevStats,
                    // --- FIX 3: Filter by explicit string 'published' ---
                    publishedCourses: updatedCourses.filter(c => c.status === 'published').length
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
        if (window.confirm("Are you sure you want to delete this user permanently? This action cannot be undone.")) {
            try {
                const response = await deleteUserAPI(userId);
                toast.success(response.message || "User deleted successfully.");
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
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
                setCourses(prevCourses => {
                    const updatedCourses = prevCourses.filter(course => course._id !== courseId);
                    setStats(prevStats => ({
                        ...prevStats,
                        totalCourses: prevStats.totalCourses - 1,
                        // --- FIX 4: Filter by explicit string 'published' ---
                        publishedCourses: updatedCourses.filter(c => c.status === 'published').length
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
