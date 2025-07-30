import React, { useEffect } from "react";
import Layout from "./components/layout";
import Dashboard from "./pages/Student/Dashboard";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import AIContentGenerator from "./pages/AIContentGenerator";
import EducatorDashboard from "./pages/Educator/Dashboard";
import CreateCourse from "./pages/Educator/CreateCourse";
import AdminPanel from "./pages/AdminPanel";
import CourseDetail from "./pages/Student/CourseDetail";
import EducatorOnboarding from "./pages/Educator/Onboarding";
import Signup from "./pages/Signup";
import StudentOnboarding from "./pages/Student/Onboarding";
import { useAuth } from "./context/AuthContext";
import useUser from "./hooks/useUser"; // <-- Import useUser
import Analytics from "./pages/Educator/Analytics";
import CoursesPage from "./pages/CoursesPage";
import Wellness from "./pages/Student/Wellness";

function App() {
  const { user } = useAuth(); // Get user from auth context
  const { fetchUser, loading: userLoading } = useUser();

  useEffect(() => {
    fetchUser();
  }, []); // Only run on mount

  if (userLoading) {
    return <div>Loading user data...</div>; 
  }

  return (
    <Layout>
      <Routes>
        <Route path='/Home' element={<Home />} />
        <Route path='/Register' element={<Signup />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/Wellness' element={<Wellness />} />
        <Route path='/AIContentGenerator' element={<AIContentGenerator />} />
        <Route path='/Analytics' element={<Analytics />} />
        <Route path='/EducatorDashboard' element={<EducatorDashboard />} />
        <Route path='/CreateCourse' element={<CreateCourse />} />
        <Route path='/AdminPanel' element={<AdminPanel />} />
        <Route path='/CourseDetail' element={<CourseDetail />} />
        <Route path='/Courses' element={<CoursesPage />} />
        <Route path="/StudentOnboarding" element={<StudentOnboarding />} />
        <Route path="/EducatorOnboarding" element={<EducatorOnboarding />} />
      </Routes>
    </Layout>
  );
}

export default App;