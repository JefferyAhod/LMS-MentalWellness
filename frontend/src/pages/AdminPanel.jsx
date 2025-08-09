import React, { useState, useEffect } from "react";
// Removed direct imports for User and Course entities as they are handled by the hook
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  BookOpen, 
  Shield, 
  Search,
  Eye,
  Ban, // For disabling/enabling users
  CheckCircle,
  XCircle,
  Crown,
  Loader2, // Added for loading spinner
  AlertCircle, // Added for error display
  Trash2 // Added for delete buttons
} from "lucide-react";

import { useAdminData } from "@/hooks/useAdminData"; // Import the new custom hook

export default function AdminPanel() {
  // Use the custom hook to manage all admin data and actions
  const { 
    users, 
    courses, 
    stats, 
    loading, // Represents the loading state from the hook
    error,   // Represents any error from the hook
    currentUser, // Authenticated admin user from useAuth, exposed by useAdminData
    fetchAllAdminData, // Function to refetch all data
    toggleUserRole, 
    toggleCourseStatus,
    deleteUser, // Destructure deleteUser function
    deleteCourse // Destructure deleteCourse function
  } = useAdminData();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  // Filtered lists based on search term
  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(searchTerm.toLowerCase()) // Allow searching by role too
  );

  const filteredCourses = courses.filter(course => 
    (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.educator?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) // Filter by educator's name
  );

  // --- Conditional Rendering for Loading, Error, Access Denied ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-xl text-gray-700 dark:text-gray-300">Loading admin panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Error Loading Admin Data</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          {error || "Something went wrong while fetching admin data. Please try again."}
        </p>
        <Button onClick={fetchAllAdminData} variant="outline" className="px-6 py-3">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Retry
        </Button>
      </div>
    );
  }

  // Access Denied if currentUser is not an admin.
  // This is a crucial check as the PrivateRoute already handles redirection but this provides a fallback UI.
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have admin privileges to access this panel.
          </p>
          {/* Optionally, add a button to navigate home */}
          <Button onClick={() => window.location.href = '/Home'} className="mt-4">Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage users, courses, and platform settings
            </p>
          </div>
        </div>

        {/* Stats Cards - Now use 'stats' from the hook */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Published Courses</p>
                  <p className="text-3xl font-bold">
                    {stats.publishedCourses}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button
            variant={activeTab === "courses" ? "default" : "outline"}
            onClick={() => setActiveTab("courses")}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={`Search ${activeTab === 'users' ? 'users by name or email' : 'courses by title or instructor'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>
              {activeTab === "users" ? "User Management" : "Course Management"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "users" ? (
              <div className="space-y-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            user.role === 'admin' 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {user.role || 'user'}
                        </Badge>
                        {/* Display Educator badge only if user is an educator and not already an admin */}
                        {user.role ==='educator' && user.role !== 'admin' && ( 
                          <Badge className="bg-blue-100 text-blue-800">
                            Educator
                          </Badge>
                        )}
                        {/* Make Admin/Remove Admin Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserRole(user._id, user.role)}
                          // Disable action for current logged-in admin (currentUser._id)
                          disabled={user._id === currentUser._id} 
                        >
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                        {/* Delete User Button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(user._id)}
                          // Disable delete for current logged-in admin
                          disabled={user._id === currentUser._id} 
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">No users found.</div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div key={course._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {/* Course Thumbnail or Placeholder */}
                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x48/cccccc/333333?text=No+Img'; }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {course.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {course.educator?.name || 'Unknown'} • {course.total_enrollments || 0} students
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            course.status === 'Published'
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {course.status}
                        </Badge>
                        <Badge variant="outline">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </Badge>
                        {/* Publish/Unpublish Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCourseStatus(course._id, course.status === 'Published' ? 'Pending Review' : 'Published')} // Pass string status
                        >
                          {course.status === 'Published' ? ( 
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Publish
                            </>
                          )}
                        </Button>
                        {/* Delete Course Button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCourse(course._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">No courses found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
