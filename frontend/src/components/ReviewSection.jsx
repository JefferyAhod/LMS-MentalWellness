// frontend/components/ReviewSection.jsx

import React, { useState, useCallback } from "react";
// Removed old entity imports (Review, User)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, Loader2, AlertCircle } from "lucide-react"; // Added Send, Loader2, AlertCircle for UI feedback
import { toast } from 'react-toastify'; // For user feedback (replacing alerts)

// Import the new hook and API function
import { useFetchReviews } from '../hooks/useFetchReviews'; // Hook to fetch reviews
import { submitReview } from '@/api/reviews'; // API function to submit a review
import { useAuth } from '@/context/AuthContext'; // To get the current authenticated user

export default function ReviewSection({ courseId, userEnrollment }) {
    // Fetch reviews for the current course using the hook
    const { reviews, isLoadingReviews, reviewsError, refetchReviews } = useFetchReviews(courseId);
    // Get authentication status and user data
    const { isAuthenticated, user, loading: authLoading } = useAuth();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Removed showForm state as the form visibility is now tied to review eligibility

    // Determine if the current user is eligible to write a review
    // User must be authenticated, have an enrollment, and that enrollment must be completed.
    const canReview = isAuthenticated && userEnrollment && userEnrollment.isCompleted;

    // Check if the current user has already submitted a review for this course
    const hasUserReviewed = reviews.some(review => review.student?._id === user?._id);

    // Handler for changing the star rating
    const handleRatingChange = useCallback((newRating) => {
        setRating(newRating);
    }, []);

    // Handler for submitting the review form
    const handleSubmitReview = useCallback(async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Basic client-side validation and eligibility checks
        if (!isAuthenticated) {
            toast.error("You must be logged in to submit a review.");
            return;
        }
        if (!canReview) {
            toast.error("You must be enrolled in and have completed this course to leave a review.");
            return;
        }
        if (hasUserReviewed) {
            toast.info("You have already reviewed this course.");
            return;
        }
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }
        if (comment.trim() === "") {
            toast.error("Please enter a comment for your review.");
            return;
        }

        setIsSubmitting(true); // Set submitting state to true
        try {
            // Call the API function to submit the review
            await submitReview(courseId, { rating, comment });
            toast.success("Your review has been submitted successfully!");
            setRating(0); // Reset rating input
            setComment(""); // Reset comment input
            refetchReviews(); // Re-fetch reviews to display the newly submitted one
        } catch (error) {
            console.error("Error submitting review:", error);
            // Display error message from backend or a generic one
            toast.error(error.response?.data?.message || "Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    }, [courseId, rating, comment, isAuthenticated, canReview, hasUserReviewed, refetchReviews]);

    // Helper function to render star icons
    const renderStars = (currentRating, interactive = false, onRate = null) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 ${
                            star <= currentRating
                                ? "text-yellow-500 fill-yellow-500" // Filled star
                                : "text-gray-300" // Empty star
                        } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`} // Add hover for interactive stars
                        onClick={() => interactive && onRate && onRate(star)}
                    />
                ))}
            </div>
        );
    };

    // Calculate average rating for display in CardTitle
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return (
        <Card className="mb-8 border-0">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Student Reviews ({reviews.length})</span>
                    {averageRating > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
                            {renderStars(Math.round(averageRating))} {/* Render rounded average stars */}
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Review Submission Form Section */}
                {/* Show form only if user can review and hasn't reviewed yet */}
                {canReview && !hasUserReviewed && (
                    <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Leave a Review</h4>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            {/* Star Rating Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Your Rating
                                </label>
                                {renderStars(rating, true, handleRatingChange)} {/* Interactive stars for input */}
                            </div>
                            {/* Comment Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Your Comment
                                </label>
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your thoughts about this course..."
                                    rows={4}
                                    required
                                    className="min-h-[100px]"
                                />
                            </div>
                            {/* Submit and Cancel Buttons */}
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" /> Submit Review
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Reset form and hide it (if you want to re-introduce a toggle)
                                        // For now, the form hides automatically after submission or if eligibility changes
                                        setRating(0);
                                        setComment("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Messages for review eligibility */}
                {/* Show if user has already reviewed */}
                {hasUserReviewed && (
                    <div className="mb-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300">
                        <p className="font-medium">You have already submitted a review for this course.</p>
                    </div>
                )}
                {/* Show if user is not authenticated */}
                {!isAuthenticated && !authLoading && ( // Ensure authLoading is false before showing this
                    <div className="mb-8 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-300">
                        <p className="font-medium">Please log in to leave a review.</p>
                    </div>
                )}
                {/* Show if user is authenticated but not eligible to review (not completed course) */}
                {isAuthenticated && !canReview && !hasUserReviewed && (
                    <div className="mb-8 p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300">
                        <p className="font-medium">You must complete this course to leave a review.</p>
                    </div>
                )}

                {/* Display Reviews List */}
                {isLoadingReviews ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="ml-3 text-gray-600 dark:text-gray-300">Loading reviews...</p>
                    </div>
                ) : reviewsError ? (
                    <div className="text-center py-8 text-red-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <p>Error loading reviews: {reviewsError.message || 'Something went wrong.'}</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                                <div className="flex items-center mb-2">
                                    {/* Display reviewer's name (populated from backend) or a fallback */}
                                    <p className="font-semibold text-gray-900 dark:text-white mr-2">
                                        {review.user?.name || review.user?.email || "Anonymous User"}
                                    </p>
                                    <div className="flex">
                                        {renderStars(review.rating)} {/* Non-interactive stars for display */}
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()} {/* Use createdAt from timestamps */}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review this course!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
