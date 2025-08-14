import { useState, useEffect, useCallback } from 'react';
import axios from '@/api/axios'; // Ensure your axios path is correct
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook

/**
 * Custom hook to fetch recommended courses.
 * It intelligently fetches personalized recommendations if the user is authenticated
 * and their profile data is available, otherwise it fetches popular courses as a fallback.
 * It waits for the AuthContext to complete its initial loading before making any API calls.
 *
 * @param {string} category - Optional category filter for recommendations.
 * @param {number} limit - The maximum number of recommended courses to fetch.
 * @returns {object} - Contains recommendedCourses, isLoading, and error state.
 */
export const useFetchRecommendedCourses = (category, limit = 3) => {
    // Get authentication status and loading state directly from AuthContext.
    // This hook will now independently know the auth status and its loading state.
    const { isAuthenticated, loading: authContextLoading } = useAuth(); // Renamed loading to authContextLoading to distinguish

    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Manages loading state for this specific fetch operation
    const [error, setError] = useState(null); // Manages error state for this specific fetch operation

    // useEffect hook to trigger the fetch operation.
    // This effect runs when its dependencies (category, limit, isAuthenticated, authContextLoading) change.
    useEffect(() => {
        const controller = new AbortController(); // For cleanup if component unmounts or dependencies change
        const signal = controller.signal;

        const fetchData = async () => {
            setIsLoading(true); // Set loading to true at the start of fetch attempt
            setError(null); // Clear any previous errors

            // Crucial Race Condition Fix:
            // ONLY proceed with fetching if AuthContext has finished its initial loading check.
            // `authContextLoading` will be true initially and then false once the
            // /auth/me call (or similar initial check in AuthContext) completes.
            if (authContextLoading) {
                setIsLoading(false); // Set local loading to false while AuthContext completes its initial check
                return; // Do not proceed with the API call yet
            }

            try {
                // The backend's /courses/recommended endpoint is designed to:
                // 1. Provide personalized courses if req.user is populated (user is authenticated AND has a profile).
                // 2. Fallback to popular courses if user is not authenticated, no profile, or LLM fails.
                // So, once authContextLoading is false, we can always hit this endpoint.
                const url = category && category !== "all"
                    ? `/courses/recommended?category=${category}&limit=${limit}`
                    : `/courses/recommended?limit=${limit}`;


                const response = await axios.get(url, { signal }); // Pass signal for aborting
                setRecommendedCourses(response.data);

            } catch (err) {
                if (axios.isCancel(err)) {
                    // This error is expected when the fetch is aborted due to cleanup or dependency change
                    console.log('Fetch for recommended courses aborted:', err.message);
                } else {
                    console.error("Failed to fetch recommended courses:", err);
                    setError(err.response?.data?.message || err.message || "Failed to fetch recommendations. Please try again later.");
                    setRecommendedCourses([]); // Ensure courses array is empty on error
                }
            } finally {
                setIsLoading(false); // Always set loading to false when fetch attempt completes (success or error)
            }
        };

        // Call the data fetching function
        fetchData();

        // Cleanup function for useEffect:
        // This runs if the component unmounts OR if any of the dependencies change
        // before the current fetchData call completes. It aborts the ongoing fetch.
        return () => {
            controller.abort();
        };
    }, [category, limit, isAuthenticated, authContextLoading]); // Dependencies for useEffect:
    // - `category`, `limit`: To re-trigger fetch if the filtering parameters change.
    // - `isAuthenticated`, `authContextLoading`: To re-trigger fetch when authentication
    //   status becomes stable or changes (e.g., after login/logout, or initial check completes).

    // Return combined loading status:
    // `isLoading` from this hook's internal state (for the API call itself)
    // OR `authContextLoading` from AuthContext (for the initial authentication check)
    // This ensures that the consuming component (e.g., Home.jsx) shows a loading spinner
    // until both authentication is confirmed AND the recommended courses have been fetched.
    return { recommendedCourses, isLoading: isLoading || authContextLoading, error };
};
