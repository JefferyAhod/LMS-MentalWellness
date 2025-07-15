import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, 
  Home, 
  User, 
  Heart, 
  GraduationCap, 
  Settings, 
  Sun, 
  Moon, 
  Menu,
  X,
  Crown,
  Users,
  BarChart3,
  Sparkles,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as UserEntity } from "@/entities/User";

const navigation = [
  { name: "Home", href: createPageUrl("Home"), icon: Home },
  { name: "Dashboard", href: createPageUrl("Dashboard"), icon: User },
  { name: "Wellness", href: createPageUrl("Wellness"), icon: Heart },
];

const educatorNavigation = [
  { name: "Educator Dashboard", href: createPageUrl("EducatorDashboard"), icon: GraduationCap },
  { name: "Create Course", href: createPageUrl("CreateCourse"), icon: BookOpen },
  { name: "Analytics", href: createPageUrl("Analytics"), icon: BarChart3 },
  { name: "AI Content", href: createPageUrl("AIContentGenerator"), icon: Sparkles },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated");
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleBecomeEducator = async () => {
    if (user) {
      await UserEntity.updateMyUserData({ is_educator: true });
      setUser({ ...user, is_educator: true });
    }
  };

  const handleLogin = async () => {
    await UserEntity.login();
  };

  const handleLogout = async () => {
    await UserEntity.logout();
    setUser(null);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <style>
        {`
          :root {
            --primary: #3B82F6;
            --primary-dark: #2563EB;
            --secondary: #8B5CF6;
            --success: #10B981;
            --warning: #F59E0B;
            --background: #FFFFFF;
            --surface: #F9FAFB;
            --text: #111827;
            --text-muted: #6B7280;
            --border: #E5E7EB;
          }
          
          .dark {
            --background: #111827;
            --surface: #1F2937;
            --text: #F9FAFB;
            --text-muted: #9CA3AF;
            --border: #374151;
          }
          
          * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
          }
        `}
      </style>
      
      <div className="min-h-screen bg-white dark:bg-gray-900" style={{ backgroundColor: "var(--background)" }}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to={createPageUrl("Home")} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">LectureMate</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.href || location.pathname === item.href.split('?')[0]
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
                
                {user?.is_educator && (
                  <>
                    {educatorNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === item.href || location.pathname === item.href.split('?')[0]
                            ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                            : "text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    ))}
                  </>
                )}
              </nav>

              {/* Right side actions */}
              <div className="flex items-center gap-4">
                {user?.is_admin && (
                  <Link to={createPageUrl("AdminPanel")}>
                    <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}

                {user && !user.is_educator && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBecomeEducator}
                    className="hidden sm:flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Become Educator
                  </Button>
                )}

                {/* Auth Button */}
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                      {user.full_name}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={handleLogin}>
                    <Link to={'/login'}>
                    Login
                    </Link>
                  </Button>
                )}

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-9 h-9 p-0"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden w-9 h-9 p-0"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Menu className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === item.href || location.pathname === item.href.split('?')[0]
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
                
                {user?.is_educator && (
                  <>
                    {educatorNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                          location.pathname === item.href || location.pathname === item.href.split('?')[0]
                            ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                            : "text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    ))}
                  </>
                )}
                
                {user?.is_admin && (
                  <Link to={createPageUrl("AdminPanel")}>
                    <Button variant="outline" className="w-full justify-start gap-2 mt-2">
                      <Crown className="w-4 h-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                
                {user && !user.is_educator && (
                  <Button 
                    variant="outline" 
                    onClick={handleBecomeEducator}
                    className="w-full justify-start gap-2 mt-2"
                  >
                    <Users className="w-4 h-4" />
                    Become Educator
                  </Button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}