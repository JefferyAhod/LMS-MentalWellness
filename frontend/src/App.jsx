import React, { useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom"; 
import { toast } from "react-toastify"; 

import Layout from "./components/layout";
import StudentDashboard from "./pages/Student/StudentDashboard.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AIContentGenerator from "./pages/AIContentGenerator";
import EducatorDashboard from "./pages/Educator/EducatorDashboard.jsx";
import CreateCourse from "./pages/Educator/CreateCourse";
import AdminPanel from "./pages/AdminPanel";
import CourseDetail from "./pages/Student/CourseDetail";
import EducatorOnboarding from "./pages/Educator/EducatorOnboarding.jsx";
import Signup from "./pages/Signup";
import StudentOnboarding from "./pages/Student/StudentOnboarding.jsx";
import { useAuth } from "./context/AuthContext.jsx"; 
import useUser from "./hooks/useUser"; 
import Analytics from "./pages/Educator/Analytics";
import CoursesPage from "./pages/CoursesPage";
import Wellness from "./pages/Student/Wellness";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// A simple PrivateRoute component to handle redirection logic
const PrivateRoute = ({ children, allowedRoles = [], requiresOnboarding = false }) => {
  const { user, isAuthenticated, isOnboardingComplete, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  useEffect(() => {
    // If auth is still loading, do nothing yet
    if (authLoading) return;

    // 1. Check Authentication
    if (!isAuthenticated) {
      toast.info("Please log in to access this page.");
      navigate("/Login", { state: { from: location }, replace: true }); 
      return;
    }

    // 2. Check Onboarding Status (if required for this route)
    if (requiresOnboarding && !isOnboardingComplete) {
      // User is logged in but onboarding is not complete
      if (user?.role === "student") {
        toast.warn("Please complete your student onboarding first.");
        navigate("/StudentOnboarding", { replace: true });
      } else if (user?.role === "educator") {
        toast.warn("Please complete your educator onboarding first.");
        navigate("/EducatorOnboarding", { replace: true });
      } else {
        // Fallback for unexpected roles not having a specific onboarding
        toast.warn("Please complete your onboarding first.");
        navigate("/Home", { replace: true });
      }
      return;
    }

    // 3. Check Role Authorization (if allowedRoles are specified)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      toast.error("You do not have permission to access this page.");
      // Redirect based on user's role or to a generic unauthorized page
      if (user?.role === 'student') navigate("/StudentDashboard", { replace: true });
      else if (user?.role === 'educator') navigate("/EducatorDashboard", { replace: true });
      else navigate("/Home", { replace: true }); // Or a dedicated /unauthorized page
      return;
    }

    // If all checks pass, render the children
  }, [isAuthenticated, isOnboardingComplete, user, authLoading, allowedRoles, requiresOnboarding, navigate, location]);

  if (authLoading || (!isAuthenticated && !authLoading) || (requiresOnboarding && !isOnboardingComplete) || (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {authLoading ? <div>Loading user data...</div> : null}
      </div>
    );
  }

  // If user is authenticated and authorized, render the children
  return children;
};


function App() {
  const { user, loading: authLoading, isAuthenticated, isOnboardingComplete } = useAuth();

  const { fetchUser, loading: userLoading } = useUser();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser(); 
    }
  }, [isAuthenticated, fetchUser]); 

  // Global loading state for initial app load
  // if (authLoading || userLoading) {
  //   return <div className="min-h-screen flex items-center justify-center">Loading application...</div>;
  // }

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} /> {/* Set / as default home */}
        <Route path='/Home' element={<Home />} />
        <Route path='/Register' element={<Signup />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/Courses' element={<CoursesPage />} />

        {/* Onboarding Routes - accessible only if not onboarded and authenticated */}
        <Route path="/StudentOnboarding" element={
          <PrivateRoute allowedRoles={['student']} requiresOnboarding={false}>
            <StudentOnboarding />
          </PrivateRoute>
        } />
        <Route path="/EducatorOnboarding" element={
          <PrivateRoute allowedRoles={['educator']} requiresOnboarding={false}>
            <EducatorOnboarding />
          </PrivateRoute>
        } />

        {/* Protected Routes - require authentication and completed onboarding */}
        <Route path='/StudentDashboard' element={
          <PrivateRoute allowedRoles={['student']} requiresOnboarding={true}>
            <StudentDashboard />
          </PrivateRoute>
        } />
        <Route path='/Wellness' element={
          <PrivateRoute allowedRoles={['student']} requiresOnboarding={true}>
            <Wellness />
          </PrivateRoute>
        } />
        <Route path='/AIContentGenerator' element={
          <PrivateRoute allowedRoles={['educator']} requiresOnboarding={true}>
            <AIContentGenerator />
          </PrivateRoute>
        } />
        <Route path='/Analytics' element={
          <PrivateRoute allowedRoles={['educator']} requiresOnboarding={true}>
            <Analytics />
          </PrivateRoute>
        } />
        <Route path='/EducatorDashboard' element={
          <PrivateRoute allowedRoles={['educator']} requiresOnboarding={true}>
            <EducatorDashboard />
          </PrivateRoute>
        } />
        <Route path='/CreateCourse' element={
          <PrivateRoute allowedRoles={['educator']} requiresOnboarding={true}>
            <CreateCourse />
          </PrivateRoute>
        } />
        <Route path='/AdminPanel' element={
          <PrivateRoute allowedRoles={['admin']} requiresOnboarding={false}>
            <AdminPanel />
          </PrivateRoute>
        } />
        <Route path='/CourseDetail' element={
          <PrivateRoute allowedRoles={['student']} requiresOnboarding={true}>
            <CourseDetail />
          </PrivateRoute>
        } />

        {/* Catch-all for undefined routes (optional) */}
        <Route path="*" element={<NotFoundPage />} /> 
      </Routes>
    </Layout>
  );
}

export default App;