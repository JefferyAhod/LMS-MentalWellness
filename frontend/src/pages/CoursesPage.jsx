// frontend/pages/CoursesPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Loader2 } from "lucide-react"; // Added Loader2 for loading spinner

import CourseCard from "../components/CourseCard";
import { useFetchCourses } from '../hooks/useFetchCourses'; // Import the new hook

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Use the new custom hook to fetch courses
    // The hook will manage the 'courses', 'isLoading', 'error', and 'pagination' states
    const {
        courses,
        isLoading,
        error,
        pagination,
        setParams // Function to update fetch parameters (search, category, page, limit)
    } = useFetchCourses({
        category: selectedCategory,
        search: searchQuery,
        page: 1, // Start on page 1 for initial load
        limit: 9 // Adjust limit as needed for your grid layout (e.g., 9 courses per page)
    });

    // Removed DUMMY_COURSES_DATA as we are now fetching from the backend

    const categoriesList = [
        { id: "all", name: "All Categories" },
        { id: "programming", name: "Programming" },
        { id: "design", name: "Design" },
        { id: "business", name: "Business" },
        { id: "marketing", name: "Marketing" },
        { id: "data-science", name: "Data Science" },
        { id: "photography", name: "Photography" },
        { id: "music", name: "Music" },
        { id: "language", name: "Language" },
        { id: "health", name: "Health & Fitness" },
        { id: "other", name: "Other" }
    ];

    // Effect to update fetch parameters when search query or selected category changes
    // This will trigger a re-fetch of courses from the backend
    useEffect(() => {
        // Reset to page 1 whenever search or category filters change
        setParams({ category: selectedCategory, search: searchQuery, page: 1 });
    }, [selectedCategory, searchQuery, setParams]);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // The filtering logic (filteredCourses) is now handled by the backend's getAllCourses controller
    // based on the `searchQuery` and `selectedCategory` parameters passed to `useFetchCourses`.
    // So, we no longer need the client-side `filteredCourses` state or its filter logic.

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
                        onChange={handleSearchChange}
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
                            onClick={() => handleCategoryClick(category.id)}
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
                        {/* Display totalCourses from pagination metadata */}
                        <p className="text-gray-600 dark:text-gray-400">
                            {pagination.totalCourses} courses found
                        </p>
                    </div>

                    {isLoading ? (
                        // Show skeleton loaders while loading
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-300 dark:bg-gray-700 rounded-2xl h-48 mb-4" />
                                    <div className="bg-gray-300 dark:bg-gray-700 rounded h-4 mb-2" />
                                    <div className="bg-gray-300 dark:bg-gray-700 rounded h-4 w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        // Show error message if fetch fails
                        <div className="text-center py-16 text-red-500">
                            <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Error loading courses.
                            </h3>
                            <p>Please try again later. {error.message}</p>
                        </div>
                    ) : courses.length > 0 ? (
                        // Display courses if found
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course) => (
                                <Link key={course.id} to={createPageUrl("CourseDetail", { id: course.id })}>
                                    <CourseCard course={course} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        // Display "No courses found" if no courses match criteria
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

                {/* Optional: Add Pagination Controls Here */}
                {/* You can use pagination.page, pagination.pages, and setParams({ page: newPage }) */}
                {/* For example: */}
                {/* {pagination.pages > 1 && (
                    <div className="flex justify-center mt-8 space-x-2">
                        <Button
                            onClick={() => setParams(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-gray-700 dark:text-gray-300">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                            onClick={() => setParams(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.pages}
                        >
                            Next
                        </Button>
                    </div>
                )} */}
            </div>
        </div>
    );
}
