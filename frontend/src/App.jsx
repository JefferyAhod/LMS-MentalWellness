import Layout from "./components/layout"
// import WellnessTips from "./components/WellnessTips"
import Dashboard from "./pages/Dashboard"
import Home from "./pages/Home"
import { Route, Routes } from "react-router-dom"
import Wellness from "./pages/Wellness"
import Login from "./pages/Login"
import AIContentGenerator from "./pages/AIContentGenerator"
import Analytics from "./pages/Analytics"
import EducatorDashboard from "./pages/EducatorDashboard"
import CreateCourse from "./pages/CreateCourse"
import PaymentPage from "./pages/PaymentPage"
import AdminPanel from "./pages/AdminPanel"
import CourseDetail from "./pages/CourseDetail"
import OnboardingForm from "@/pages/OnboardingForm";
import EducatorOnboarding from "./pages/EducatorOnboarding"

function App() {
  return (
    <>
      <Layout >
       <Routes>
          <Route path='/Home' element={<Home/>}/>
          <Route path='/Login' element={<Login/>}/>
          <Route path='/Dashboard' element={<Dashboard/>}/>
          <Route path='/Wellness' element={<Wellness/>}/>
          <Route path='/AIContentGenerator' element={<AIContentGenerator/>}/>
          <Route path='/Analytics' element={<Analytics/>}/>
          <Route path='/EducatorDashboard' element={<EducatorDashboard/>}/>
          <Route path='/CreateCourse' element={<CreateCourse/>}/>
          <Route path='/PaymentPage' element={<PaymentPage/>}/>
          <Route path='/AdminPanel' element={<AdminPanel/>}/>
          <Route path='/CourseDetail' element={<CourseDetail/>}/>
          <Route path="/OnboardingForm" element={<OnboardingForm />} />
          <Route path="/EducatorOnboarding" element={<EducatorOnboarding />} />
        </Routes>
        </Layout>

    </>
  )
}

export default App




