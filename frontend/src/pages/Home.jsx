import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Ensure Link is imported
import { createPageUrl } from "@/utils";
import { Course } from "@/entities/Course"; // Keep these imports for now, assuming they are needed for data fetching
import { User } from "@/entities/User"; // Keep these imports for now, assuming they are needed for data fetching

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Star } from "lucide-react";

import CourseCard from "../components/CourseCard";
import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    const categories = [
        { id: "all", name: "All Courses" },
        { id: "programming", name: "Programming" },
        { id: "design", name: "Design" },
        { id: "business", name: "Business" },
        { id: "marketing", name: "Marketing" },
        { id: "data-science", name: "Data Science" },
        { id: "photography", name: "Photography" },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // These calls are still using entities; ensure they are correctly implemented
            // or consider mocking them if you want to bypass backend for this page too.
            const [coursesData, userData] = await Promise.all([
                Course.filter({ is_published: true }, "-created_date"),
                User.me().catch(() => null),
            ]);
            setCourses(coursesData);
            setUser(userData);
        } catch (error) {
            console.error("Error loading data:", error);
            // Optionally set mock data here if load fails for UI development
            setCourses([
                { id: "mock1", title: "Intro to Python", instructor_name: "Dr. Mock", is_featured: true, category: "programming", thumbnail: "https://placehold.co/300x200/FF5733/FFFFFF?text=Python" },
                { id: "mock2", title: "UX Design Principles", instructor_name: "Prof. Dummy", is_featured: true, category: "design", thumbnail: "https://placehold.co/300x200/3498DB/FFFFFF?text=UX" },
                { id: "mock3", title: "Digital Marketing 101", instructor_name: "Ms. Fake", is_featured: true, category: "marketing", thumbnail: "https://placehold.co/300x200/27AE60/FFFFFF?text=Marketing" },
                { id: "mock4", title: "Advanced JavaScript", instructor_name: "Mr. Pseudo", is_featured: false, category: "programming", thumbnail: "https://placehold.co/300x200/8E44AD/FFFFFF?text=JS" },
                { id: "mock5", title: "Data Visualization with D3", instructor_name: "Dr. Test", is_featured: false, category: "data-science", thumbnail: "https://placehold.co/300x200/F1C40F/000000?text=D3" },
                { id: "mock6", title: "Photography Fundamentals", instructor_name: "Ms. Sample", is_featured: false, category: "photography", thumbnail: "https://placehold.co/300x200/E67E22/FFFFFF?text=Photo" },
            ]);
            setUser({ id: "mock-user-home", name: "Guest User" }); // Mock user
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            (course.title || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (course.instructor_name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || course.category === selectedCategory.toLowerCase(); // Ensure category matching is case-insensitive and matches IDs
        return matchesSearch && matchesCategory;
    });

    const featuredCourses = courses.filter((course) => course.is_featured);

    // Redirects to login page - used by HeroSection
    const handleLoginRedirect = () => {
        navigate(createPageUrl("Login")); // Use createPageUrl
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <HeroSection user={user} onAuthAction={handleLoginRedirect} />

            {/* Stats Section */}
            <StatsSection />

            {/* Search and Filter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Discover Your Next Learning Adventure
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Explore thousands of courses taught by industry experts
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-8">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Search courses, instructors, or topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={
                                selectedCategory === category.id ? "default" : "outline"
                            }
                            onClick={() => setSelectedCategory(category.id)}
                            className="rounded-full px-6 py-2 text-sm font-medium transition-all hover:scale-105"
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Featured Courses */}
                {featuredCourses.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Featured Courses
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredCourses.slice(0, 3).map((course) => (
                                <CourseCard key={course.id} course={course} featured />
                            ))}
                        </div>
                    </div>
                )}

                {/* All Courses */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedCategory === "all"
                                ? "All Courses"
                                : categories.find((c) => c.id === selectedCategory)?.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filteredCourses.length} courses found
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-300 dark:bg-gray-700 rounded-2xl h-48 mb-4" />
                                    <div className="bg-gray-300 dark:bg-gray-700 rounded h-4 mb-2" />
                                    <div className="bg-gray-300 dark:bg-gray-700 rounded h-4 w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map((course) => (
                                // Ensure CourseCard links to CourseDetail using createPageUrl
                                <Link key={course.id} to={createPageUrl("CourseDetail", { id: course.id })}>
                                    <CourseCard course={course} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No courses found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Start Teaching?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of educators sharing their knowledge on LectureMate
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white text-blue-600 hover:bg-gray-100"
                            onClick={() => navigate(createPageUrl("Login"))} // Explicitly use createPageUrl
                        >
                            Become an Educator
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-blue-600"
                            onClick={() => navigate(createPageUrl("AboutEducator"))} // New placeholder route
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
