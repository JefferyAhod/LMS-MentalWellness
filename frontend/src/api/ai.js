// frontend/src/api/ai.js
import API from "./axios"; 


export const getWellnessInsights = async (userId) => {
  try {
    const response = await API.post('/ai/insights', { userId });
    return response.data.insight; 
  } catch (error) {
    console.error('Frontend API Error - getWellnessInsights:', error);
    throw error;
  }
};


export const getAICounselorResponse = async (chatHistory) => {
  try {
    const response = await API.post('/ai/counselor', { chatHistory });
    // --- FIX IS HERE: More robust check for response.data and response.data.response ---
    // Ensure response.data exists, then ensure response.data.response exists and is a string.
    // Provide a fallback string if anything is missing or not a string.
    const aiResponseContent = response.data?.response;
    return typeof aiResponseContent === 'string' ? aiResponseContent : "I'm sorry, I couldn't process that. Please try rephrasing.";
  } catch (error) {
    console.error('Frontend API Error - getAICounselorResponse:', error);
    throw error;
  }
};

export const generateCourseOutline = async (params) => {
  try {
    const response = await API.post('/ai/generate-course-outline', params);
    return response.data.outline;
  } catch (error) {
    console.error('Frontend API Error - generateCourseOutline:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const writeCourseDescription = async (params) => {
  try {
    const response = await API.post('/ai/write-course-description', params);
    return response.data.description;
  } catch (error) {
    console.error('Frontend API Error - writeCourseDescription:', error.response ? error.response.data : error.message);
    throw error;
  }
};


export const createCourseThumbnailImage = async (params) => {
  try {
    const response = await API.post('/ai/create-course-thumbnail-image', params);
    return response.data.thumbnailImage; 
  } catch (error) {
    console.error('Frontend API Error - createCourseThumbnailImage:', error.response ? error.response.data : error.message);
    throw error;
  }
};


export const buildQuizAssessment = async (params) => {
  try {
    const response = await API.post('/ai/build-quiz-assessment', params);
    return response.data.quiz;
  } catch (error) {
    console.error('Frontend API Error - buildQuizAssessment:', error.response ? error.response.data : error.message);
    throw error;
  }
};
