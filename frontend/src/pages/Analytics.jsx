import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Course } from "@/entities/Course";
import { Enrollment } from "@/entities/Enrollment";
import { Review } from "@/entities/Review";
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
  Calendar
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [timeRange, setTimeRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [coursesData, enrollmentsData, reviewsData] = await Promise.all([
        Course.filter({ instructor_id: userData.id }),
        Enrollment.list(),
        Review.list()
      ]);

      setCourses(coursesData);
      setEnrollments(enrollmentsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate analytics metrics
  const getEnrollmentsForCourse = (courseId) => {
    return enrollments.filter(e => courseId === "all" || e.course_id === courseId);
  };

  const getRevenueData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 500) + 100,
        enrollments: Math.floor(Math.random() * 10) + 1
      };
    }).reverse();
    return last30Days;
  };

  const getCoursePerformanceData = () => {
    return courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
      const courseReviews = reviews.filter(r => r.course_id === course.id);
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

  const getCategoryData = () => {
    const categories = {};
    courses.forEach(course => {
      const category = course.category || 'other';
      const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
      if (!categories[category]) {
        categories[category] = { name: category, value: 0, color: `hsl(${Math.random() * 360}, 70%, 50%)` };
      }
      categories[category].value += courseEnrollments.length;
    });
    return Object.values(categories);
  };

  const totalRevenue = courses.reduce((sum, course) => {
    const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
    return sum + (courseEnrollments.length * (course.price || 0));
  }, 0);

  const totalStudents = new Set(enrollments.map(e => e.student_id)).size;
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const revenueData = getRevenueData();
  const coursePerformanceData = getCoursePerformanceData();
  const categoryData = getCategoryData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.is_educator) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Educator Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be an educator to access analytics.
          </p>
        </div>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title.substring(0, 30)}
                  </SelectItem>
                ))}
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
                  <p className="text-3xl font-bold">24,891</p>
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
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
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