
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Course } from "@/entities/Course";
import { Enrollment } from "@/entities/Enrollment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play,
  Heart,
  GraduationCap
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [enrollmentsData, coursesData] = await Promise.all([
        Enrollment.filter({ student_id: userData.id }),
        Course.list()
      ]);

      setEnrollments(enrollmentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnrolledCourses = () => {
    return enrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      return { ...course, enrollment };
    }).filter(Boolean);
  };

  const getCompletedCourses = () => {
    return enrollments.filter(e => e.is_completed).length;
  };

  const getTotalHours = () => {
    const enrolledCourses = getEnrolledCourses();
    return enrolledCourses.reduce((total, course) => total + (course.duration || 0), 0);
  };

  const getAverageProgress = () => {
    if (enrollments.length === 0) return 0;
    return enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access your dashboard
          </h2>
          <Button onClick={() => User.login()}>
          <Link to='/login'>Log In </Link>
          </Button>
        </div>
      </div>
    );
  }

  const enrolledCourses = getEnrolledCourses();
  const completedCourses = getCompletedCourses();
  const totalHours = getTotalHours();
  const averageProgress = getAverageProgress();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Enrolled Courses</p>
                  <p className="text-3xl font-bold">{enrollments.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed</p>
                  <p className="text-3xl font-bold">{completedCourses}</p>
                </div>
                <Award className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Learning Hours</p>
                  <p className="text-3xl font-bold">{Math.round(totalHours / 60)}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Progress</p>
                  <p className="text-3xl font-bold">{Math.round(averageProgress)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to={createPageUrl("Home")}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Browse Courses
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Discover new courses to expand your skills
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Wellness")}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Wellness Center
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track your mood and mental wellness
                </p>
              </CardContent>
            </Card>
          </Link>

          {user.is_educator && (
            <Link to={createPageUrl("EducatorDashboard")}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Educator Dashboard
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Manage your courses and students
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Courses
            </h2>
            <Link to={createPageUrl("Home")}>
              <Button variant="outline">
                Browse More Courses
              </Button>
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow border-0">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-t-lg">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <Play className="w-12 h-12 text-white opacity-70" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {(course.category || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      {course.enrollment.is_completed && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      by {course.instructor_name}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round(course.enrollment.progress)}%
                        </span>
                      </div>
                      <Progress value={course.enrollment.progress} className="h-2" />
                    </div>

                    <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                      <Button className="w-full">
                        {course.enrollment.is_completed ? "Review Course" : "Continue Learning"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-0">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start your learning journey by enrolling in a course
              </p>
              <Link to={createPageUrl("Home")}>
                <Button>
                  Browse Courses
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
