import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    Users,
    DollarSign,
    TrendingUp,
    Eye,
    Clock,
    Star,
    Download,
    Calendar,
    Loader2,
    AlertCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

import { useEducatorAnalytics } from '@/hooks/useEducatorAnalytics';
import { useAuth } from '@/context/AuthContext';

export default function Analytics() {
    const { data, loading, error, refetch } = useEducatorAnalytics();
    const { educatorProfile, courses, enrollments, reviews } = data || {};

    const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();

    const [selectedCourse, setSelectedCourse] = useState("all");
    const [timeRange, setTimeRange] = useState("currentYear");



    // Helper to filter enrollments based on selected course and time range
    const getFilteredEnrollments = (courseIdFilter, timeRangeString) => {
        if (!enrollments) return [];

        let filtered = enrollments;
        if (courseIdFilter !== "all") {
            filtered = filtered.filter(e => e.course && e.course._id === courseIdFilter);
        }

        const endDate = new Date();
        let startDate = new Date();

        if (timeRangeString === 'currentYear') {
            startDate = new Date(endDate.getFullYear(), 0, 1); 
        } else {
            const unit = timeRangeString.slice(-1); // 'd' for days, 'm' for months
            const value = parseInt(timeRangeString.slice(0, -1)); // Numeric value

            if (unit === 'd') {
                startDate.setDate(endDate.getDate() - value);
            } else if (unit === 'm') {
                startDate.setMonth(endDate.getMonth() - value);
                startDate.setDate(1); // Start from the first day of the start month
            } else {
                // Default to 30 days if unit is unrecognized
                startDate.setDate(endDate.getDate() - 30);
            }
        }

        // Filter by createdAt date
        return filtered.filter(e => new Date(e.createdAt) >= startDate && new Date(e.createdAt) <= endDate);
    };

    // Calculate revenue data for the chart
    const calculateRevenueDataForChart = () => {
        const unit = timeRange.slice(-1);
        const value = parseInt(timeRange.slice(0, -1));
        const filteredEnrollments = getFilteredEnrollments(selectedCourse, timeRange);

        if (timeRange === 'currentYear') {
            const monthlyRevenue = {};
            filteredEnrollments.forEach(enrollment => {
                const date = new Date(enrollment.createdAt);
                const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                const coursePrice = enrollment.course?.price || 0;
                if (!monthlyRevenue[yearMonth]) {
                    monthlyRevenue[yearMonth] = 0;
                }
                monthlyRevenue[yearMonth] += coursePrice;
            });

            const chartData = [];
            const currentYear = new Date().getFullYear();
            for (let i = 0; i < 12; i++) {
                const date = new Date(currentYear, i, 1);
                const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                chartData.push({
                    date: yearMonth,
                    revenue: monthlyRevenue[yearMonth] || 0
                });
            }
            return chartData;
        }
        else if (unit === 'd') {
            const dailyRevenue = {};
            filteredEnrollments.forEach(enrollment => {
                const date = new Date(enrollment.createdAt);
                const dateString = date.toISOString().split('T')[0];
                const coursePrice = enrollment.course?.price || 0;
                if (!dailyRevenue[dateString]) {
                    dailyRevenue[dateString] = 0;
                }
                dailyRevenue[dateString] += coursePrice;
            });

            const chartData = [];
            for (let i = value - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                chartData.push({
                    date: dateString,
                    revenue: dailyRevenue[dateString] || 0
                });
            }
            return chartData;
        } else if (unit === 'm') {
            const monthlyRevenue = {};
            filteredEnrollments.forEach(enrollment => {
                const date = new Date(enrollment.createdAt);
                const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                const coursePrice = enrollment.course?.price || 0;
                if (!monthlyRevenue[yearMonth]) {
                    monthlyRevenue[yearMonth] = 0;
                }
                monthlyRevenue[yearMonth] += coursePrice;
            });

            const chartData = [];
            const today = new Date();
            for (let i = value - 1; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                chartData.push({
                    date: yearMonth,
                    revenue: monthlyRevenue[yearMonth] || 0
                });
            }
            return chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        return [];
    };

    // Calculate course performance data for the chart/list
    const calculateCoursePerformanceData = () => {
        if (!courses || !enrollments || !reviews) return [];

        const filteredCourses = selectedCourse === "all"
            ? courses
            : courses.filter(c => c._id === selectedCourse);

        return filteredCourses.map(course => {
            const courseEnrollments = enrollments.filter(e => e.course && e.course._id === course._id);
            const courseReviews = reviews.filter(r => r.course && r.course._id === course._id);
            const avgRating = courseReviews.length > 0
                ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
                : 0;

            return {
                name: course.title.substring(0, 20) + (course.title.length > 20 ? '...' : ''),
                enrollments: courseEnrollments.length,
                revenue: courseEnrollments.length * (course.price || 0),
                rating: avgRating,
                completion: courseEnrollments.filter(e => e.is_completed).length
            };
        });
    };

    // Calculate category distribution data for the pie chart
    const calculateCategoryData = () => {
        if (!courses || !enrollments) return [];
        const categories = {};
        const filteredCourses = selectedCourse === "all"
            ? courses
            : courses.filter(c => c._id === selectedCourse);

        filteredCourses.forEach(course => {
            const category = course.category || 'Other';
            const courseEnrollments = enrollments.filter(e => e.course && e.course._id === course._id);
            if (!categories[category]) {
                categories[category] = { name: category, value: 0, color: `hsl(${Math.random() * 360}, 70%, 50%)` };
            }
            categories[category].value += courseEnrollments.length;
        });
        return Object.values(categories);
    };

    // Calculate top-level metrics using useMemo for optimization
    const totalRevenue = useMemo(() => {
        if (!enrollments) return 0;
        let sum = 0;
        const relevantEnrollments = selectedCourse === "all"
            ? enrollments
            : enrollments.filter(e => e.course && e.course._id === selectedCourse);

        relevantEnrollments.forEach(e => {
            if (e.course && e.course.price !== undefined) {
                sum += e.course.price;
            }
        });
        return sum;
    }, [enrollments, selectedCourse]);

    const totalStudents = useMemo(() => {
        if (!enrollments) return 0;
        const relevantEnrollments = selectedCourse === "all"
            ? enrollments
            : enrollments.filter(e => e.course && e.course._id === selectedCourse);
        const uniqueStudents = new Set(relevantEnrollments.map(e => e.student?._id).filter(Boolean));
        return uniqueStudents.size;
    }, [enrollments, selectedCourse]);

    const avgRating = useMemo(() => {
        if (!reviews) return 0;
        const relevantReviews = selectedCourse === "all"
            ? reviews
            : reviews.filter(r => r.course && r.course._id === selectedCourse);

        if (relevantReviews.length === 0) return 0;
        const total = relevantReviews.reduce((sum, r) => sum + r.rating, 0);
        return total / relevantReviews.length;
    }, [reviews, selectedCourse]);

    // Dynamic Course Views from educatorProfile
    const totalCourseViews = useMemo(() => {
        return educatorProfile?.totalCourseViews || 0;
    }, [educatorProfile]);


    // Memoized data for charts
    const revenueData = useMemo(() => calculateRevenueDataForChart(), [selectedCourse, timeRange, enrollments]);
    const coursePerformanceData = useMemo(() => calculateCoursePerformanceData(), [selectedCourse, courses, enrollments, reviews]);
    const categoryData = useMemo(() => calculateCategoryData(), [selectedCourse, courses, enrollments]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="ml-4 text-xl text-gray-700 dark:text-gray-300">Loading analytics dashboard...</p>
            </div>
        );
    }

    if (!isAuthenticated || authUser?.role !== "educator") {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You need to be an educator to access this dashboard.
                    </p>
                  
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Error Loading Analytics</h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                    {error.message || "Something went wrong while fetching analytics data. Please try again."}
                </p>
                <Button onClick={refetch} variant="outline" className="px-6 py-3">
                    <TrendingUp className="w-5 h-5 mr-2" /> Try Again
                </Button>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Analytics Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Track your course performance and revenue
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses?.map(course => (
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.title.substring(0, 30)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Time Range Select */}
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Time Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="currentYear">Current Year (Monthly)</SelectItem>
                                <SelectItem value="7d">Last 7 Days (Daily)</SelectItem>
                                <SelectItem value="30d">Last 30 Days (Daily)</SelectItem>
                                <SelectItem value="3m">Last 3 Months (Rolling)</SelectItem>
                                <SelectItem value="6m">Last 6 Months (Rolling)</SelectItem>
                                <SelectItem value="12m">Last 12 Months (Rolling)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Revenue</p>
                                    <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
                                    <p className="text-blue-100 text-xs">+12% from last month</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Total Students</p>
                                    <p className="text-3xl font-bold">{totalStudents}</p>
                                    <p className="text-green-100 text-xs">+8% from last month</p>
                                </div>
                                <Users className="w-8 h-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm">Avg Rating</p>
                                    <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
                                    <p className="text-purple-100 text-xs">+0.2 from last month</p>
                                </div>
                                <Star className="w-8 h-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">Course Views</p>
                                    <p className="text-3xl font-bold">{totalCourseViews.toLocaleString()}</p>
                                    <p className="text-orange-100 text-xs">+18% from last month</p>
                                </div>
                                <Eye className="w-8 h-8 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Revenue Chart */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            if (timeRange === 'currentYear' || timeRange.endsWith('m')) {
                                                const [year, month] = value.split('-');
                                                const date = new Date(year, parseInt(month) - 1, 1);
                                                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                                            } else if (timeRange.endsWith('d')) {
                                                return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            }
                                            return value;
                                        }}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(value) => {
                                            if (timeRange === 'currentYear' || timeRange.endsWith('m')) {
                                                const [year, month] = value.split('-');
                                                const date = new Date(year, parseInt(month) - 1, 1);
                                                return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                            } else if (timeRange.endsWith('d')) {
                                                return new Date(value).toLocaleDateString();
                                            }
                                            return value;
                                        }}
                                        formatter={(value, name) => [`$${value}`, 'Revenue']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Course Performance */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Course Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={coursePerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="enrollments" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Distribution & Top Courses */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Category Distribution */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Enrollments by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Performing Courses */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Top Performing Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {coursePerformanceData
                                    .slice() // IMPORTANT: Create a shallow copy before sorting
                                    .sort((a, b) => b.revenue - a.revenue)
                                    .slice(0, 5)
                                    .map((course, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {course.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {course.enrollments} students
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    ${course.revenue}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-500" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {course.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
