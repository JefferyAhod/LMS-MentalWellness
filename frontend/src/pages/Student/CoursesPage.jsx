// frontend/pages/CoursesPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";

import CourseCard from "../../components/CourseCard"; // Assuming CourseCard component exists

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    // Define dummy data for courses directly in the component
    const DUMMY_COURSES_DATA = [
        { id: "course101", title: "Introduction to Python Programming", instructor_name: "Alice Smith", is_published: true, category: "programming", level: "Beginner", price: 49.99, thumbnail: "https://placehold.co/300x200/FF5733/FFFFFF?text=Python" },
        { id: "course102", title: "Advanced JavaScript for Web Development", instructor_name: "Bob Johnson", is_published: true, category: "programming", level: "Intermediate", price: 79.99, thumbnail: "https://placehold.co/300x200/3498DB/FFFFFF?text=JavaScript" },
        { id: "course103", title: "UI/UX Design Fundamentals", instructor_name: "Charlie Brown", is_published: true, category: "design", level: "Beginner", price: 59.99, thumbnail: "https://placehold.co/300x200/27AE60/FFFFFF?text=UI/UX" },
        { id: "course104", title: "Digital Marketing Strategies 2024", instructor_name: "Diana Prince", is_published: true, category: "marketing", level: "Intermediate", price: 69.99, thumbnail: "https://placehold.co/300x200/8E44AD/FFFFFF?text=Marketing" },
        { id: "course105", title: "Data Science with R", instructor_name: "Eve Adams", is_published: true, category: "data-science", level: "Advanced", price: 99.99, thumbnail: "https://placehold.co/300x200/F1C40F/000000?text=Data+Science" },
        { id: "course106", title: "Photography: Mastering Your DSLR", instructor_name: "Frank White", is_published: true, category: "photography", level: "Beginner", price: 39.99, thumbnail: "https://placehold.co/300x200/E67E22/FFFFFF?text=Photography" },
        { id: "course107", title: "Business Analytics with Excel", instructor_name: "Grace Lee", is_published: true, category: "business", level: "Intermediate", price: 65.00, thumbnail: "https://placehold.co/300x200/1ABC9C/FFFFFF?text=Business" },
        { id: "course108", title: "Mobile App Design with Figma", instructor_name: "Henry Cavill", is_published: true, category: "design", level: "Intermediate", price: 75.00, thumbnail: "https://placehold.co/300x200/9B59B6/FFFFFF?text=Figma" },
        { id: "course109", title: "SQL for Data Analysis", instructor_name: "Ivy Green", is_published: true, category: "data-science", level: "Beginner", price: 55.00, thumbnail: "https://placehold.co/300x200/34495E/FFFFFF?text=SQL" },
        { id: "course110", title: "Content Marketing Masterclass", instructor_name: "Jack Black", is_published: true, category: "marketing", level: "Advanced", price: 85.00, thumbnail: "https://placehold.co/300x200/D35400/FFFFFF?text=Content+Marketing" },
    ];

    const categoriesList = [
        { id: "all", name: "All Categories" },
        { id: "programming", name: "Programming" },
        { id: "design", name: "Design" },
        { id: "business", name: "Business" },
        { id: "marketing", name: "Marketing" },
        { id: "data-science", name: "Data Science" },
        { id: "photography", name: "Photography" },
        // Add more categories as needed
    ];

    useEffect(() => {
        // Simulate data loading delay
        const timer = setTimeout(() => {
            setCourses(DUMMY_COURSES_DATA);
            setIsLoading(false);
        }, 800); // Simulate 800ms loading time

        return () => clearTimeout(timer);
    }, []);

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            (course.title || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (course.instructor_name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesCategory =
            selectedCategory === "all" || course.category.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Explore Our Courses
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Dive into a world of knowledge with courses across various disciplines.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-3xl mx-auto mb-8">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Search for courses or instructors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categoriesList.map((category) => (
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

                {/* Course Listing */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedCategory === "all"
                                ? "All Courses"
                                : categoriesList.find((c) => c.id === selectedCategory)?.name + " Courses"}
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
        </div>
    );
}
