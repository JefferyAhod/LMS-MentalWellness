import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext.jsx"; // Ensure .jsx extension for AuthContext

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { AtSign, Lock } from "lucide-react";

export default function Login() {
  // Get login function, loading state, error, and user object from AuthContext
  const { login, loading, error, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showError, setShowError] = useState(false); // State to control error message visibility

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      setShowError(true); // Show error if fields are empty
      return;
    }

    // Attempt to log in
    const result = await login(formData);

    if (result.success) {
      toast.success("Logged in successfully!");

      // Access the user object directly from the AuthContext's state
      // after a successful login, as it would have been updated by `setUser` in AuthContext.
      // We can also use `result.user` if your `login` function in AuthContext returns it.
      // Assuming `user` from `useAuth()` will be updated by the `login` function's `setUser` call.
      const loggedInUser = user; // Use the user from context, which should be updated

      // Fallback in case user from context isn't immediately updated
      // (though it should be if login() calls setUser correctly)
      const userRole = loggedInUser?.role || 'student'; // Default to student if role is missing
      const onboardingStatus = loggedInUser?.onboardingCompleted;

      if (onboardingStatus === false) {
        // User is logged in but onboarding is not complete
        if (userRole === "student") {
          navigate("/StudentOnboarding");
        } else if (userRole === "educator") {
          navigate("/EducatorOnboarding");
        } else {
          // Fallback for unexpected roles
          navigate("/Home");
        }
      } else {
        // User is logged in and onboarding is complete
        if (userRole === "student") {
          navigate("/StudentDashboard"); // Navigate to student dashboard
        } else if (userRole === "educator") {
          navigate("/EducatorDashboard"); // Navigate to educator dashboard
        } else {
          // Fallback for unexpected roles
          navigate("/Home");
        }
      }
    } else {
      // Login failed, error message already set by AuthContext
      setShowError(true); // Show the error message from AuthContext
      toast.error(error || "Login failed. Please try again."); // Display toast with error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-[90%] max-w-md shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <img
            src="/logo/owl.png"
            alt="Logo"
            className="w-16 h-16 rounded-full border p-1 bg-white"
          />
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to LectureMate
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Sign in to continue
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pb-8">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2 border-gray-300 dark:border-gray-700"
            >
              <FcGoogle size={20} />
              Continue with Google
            </Button>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Display error from AuthContext if present and showError is true */}
            {error && showError && (
              <div className="bg-red-100 text-red-700 text-sm rounded-md px-4 py-2 text-center border border-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="flex justify-between text-sm text-gray-500 mt-4">
              <a href="#" className="hover:underline">
                Forgot password?
              </a>
              <a href="/signup" className="hover:underline">
                Sign up
              </a>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}