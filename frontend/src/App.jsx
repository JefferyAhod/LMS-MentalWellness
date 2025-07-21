import React, { useEffect } from "react";
import Layout from "./components/layout";
import Dashboard from "./pages/Student/Dashboard";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import Wellness from "./pages/Wellness";
import Login from "./pages/Login";
import AIContentGenerator from "./pages/AIContentGenerator";
import EducatorDashboard from "./pages/Educator/Dashboard";
import CreateCourse from "./pages/Educator/CreateCourse";
import PaymentPage from "./pages/PaymentPage";
import AdminPanel from "./pages/AdminPanel";
import CourseDetail from "./pages/CourseDetail";
import EducatorOnboarding from "./pages/Educator/Onboarding";
import Signup from "./pages/Signup";
import StudentOnboarding from "./pages/Student/Onboarding";
import { useAuth } from "./context/AuthContext";
import useUser from "./hooks/useUser"; // <-- Import useUser
import Analytics from "./pages/Educator/Analytics";

function App() {
  const { user } = useAuth(); // Get user from auth context
  const { fetchUser, loading: userLoading } = useUser();

  useEffect(() => {
    fetchUser();
    // Optionally, add logic to only fetch if a token exists
    // Example: if (localStorage.getItem("token")) fetchUser();
  }, []); // Only run on mount

  if (userLoading) {
    return <div>Loading user data...</div>; // Simple loading indicator
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
        <Route path='/PaymentPage' element={<PaymentPage />} />
        <Route path='/AdminPanel' element={<AdminPanel />} />
        <Route path='/CourseDetail' element={<CourseDetail />} />
        <Route path="/StudentOnboarding" element={<StudentOnboarding />} />
        <Route path="/EducatorOnboarding" element={<EducatorOnboarding />} />
      </Routes>
    </Layout>
  );
}

export default App;