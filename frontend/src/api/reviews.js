// frontend/src/api/reviews.js

import API from './axios'; // Assuming your Axios instance is exported as 'API' from './axios.js'

export const getReviewsForCourse = async (courseId) => {
    try {
        const res = await API.get(`/reviews/${courseId}`); // Assuming backend route like /api/reviews/:courseId
        return res.data;
    } catch (error) {
        console.error(`Error fetching reviews for course ${courseId}:`, error.response?.data?.message || error.message);
        throw error;
    }
};


export const submitReview = async (courseId, reviewData) => {
    try {
        const res = await API.post(`/reviews/${courseId}`, reviewData); // Assuming backend route like /api/reviews/:courseId
        return res.data;
    } catch (error) {
        console.error(`Error submitting review for course ${courseId}:`, error.response?.data?.message || error.message);
        throw error;
    }
};
