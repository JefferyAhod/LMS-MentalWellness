
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Course } from "@/entities/Course";
import { Enrollment } from "@/entities/Enrollment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  BookOpen, 
  Users, 
  Star, 
  DollarSign, 
  TrendingUp,
  Edit,
  Eye,
  BarChart3
} from "lucide-react";

export default function EducatorDashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEducatorData();
  }, []);

  const loadEducatorData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [coursesData, enrollmentsData] = await Promise.all([
        Course.filter({ instructor_id: userData.id }),
        Enrollment.list()
      ]);

      setCourses(coursesData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error("Error loading educator data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatsForCourse = (courseId) => {
    const courseEnrollments = enrollments.filter(e => e.course_id === courseId);
    const completedCount = courseEnrollments.filter(e => e.is_completed).length;
    const avgProgress = courseEnrollments.length > 0 
      ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length 
      : 0;

    return {
      totalEnrollments: courseEnrollments.length,
      completedCount,
      avgProgress
    };
  };

  const totalStudents = enrollments.filter(e => 
    courses.some(c => c.id === e.course_id)
  ).length;

  const totalRevenue = courses.reduce((sum, course) => {
    const courseEnrollments = enrollments.filter(e => e.course_id === course.id).length;
    return sum + (course.price * courseEnrollments);
  }, 0);

  const avgRating = courses.length > 0 
    ? courses.reduce((sum, course) => sum + (course.average_rating || 0), 0) / courses.length 
    : 0;

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
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be an educator to access this dashboard.
          </p>
          <Button onClick={() => User.updateMyUserData({ is_educator: true })}>
            Become an Educator
          </Button>
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
              Educator Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your courses and track your teaching impact
            </p>
          </div>
          <Link to={createPageUrl("CreateCourse")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold">{courses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Students</p>
                  <p className="text-3xl font-bold">{totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold">${totalRevenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Rating</p>
                  <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
                </div>
                <Star className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => {
                  const stats = getStatsForCourse(course.id);
                  return (
                    <div key={course.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {(course.category || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={course.is_published ? "bg-green-500" : "bg-yellow-500"}>
                            {course.is_published ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">
                            {course.price === 0 ? "Free" : `$${course.price}`}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {stats.totalEnrollments}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Students
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {stats.completedCount}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Completed
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {Math.round(stats.avgProgress)}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Avg Progress
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {course.average_rating || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Rating
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link to={createPageUrl(`EditCourse?id=${course.id}`)}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No courses yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first course to start teaching
                </p>
                <Link to={createPageUrl("CreateCourse")}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Course
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
