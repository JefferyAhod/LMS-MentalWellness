import API from "./axios"; 

export const getCourses = async (params = {}) => {
    try {
        const { category = 'all', search = '', page = 1, limit = 10 } = params;
        const queryString = new URLSearchParams({
            category: category,
            search: search,
            page: page,
            limit: limit
        }).toString();

        const res = await API.get(`/courses?${queryString}`);
        return res.data; 
    } catch (error) {
        console.error("Error fetching courses:", error.response?.data?.message || error.message);
        throw error;
    }
};

export const getCourseById = async (courseId) => {
    try {
        const res = await API.get(`/courses/${courseId}`);
        return res.data; 
    } catch (error) {
        console.error(`Error fetching course ${courseId}:`, error.response?.data?.message || error.message);
        throw error;
    }
};


export const getFeaturedCourses = async (limit = 3) => {
    try {
        const res = await API.get(`/courses/featured?limit=${limit}`);
        return res.data; 
    } catch (error) {
        console.error("Error fetching featured courses:", error.response?.data?.message || error.message);
        throw error;
    }
};

export const getRecommendedCourses = async (limit = 3) => {
    try {
        const res = await API.get(`/courses/recommended?limit=${limit}`);
        return res.data; 
    } catch (error) {
        console.error("Error fetching recommended courses:", error.response?.data?.message || error.message);
        throw error;
    }
};
