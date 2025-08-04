import API from "./axios"; 


export const getWellnessInsights = async (data) => {
  try {
    const response = await API.post('/ai/insights', data);
    return response.insight; 
  } catch (error) {
    console.error('Frontend API Error - getWellnessInsights:', error);
    throw error;
  }
};


export const getAICounselorResponse = async (chatHistory) => {
  try {
    const response = await API.post('/ai/counselor', { chatHistory });
    return response.response;
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


export const createCourseThumbnailIdea = async (params) => {
  try {
    const response = await API.post('/ai/create-course-thumbnail-idea', params);
    return response.data.thumbnailIdea;
  } catch (error) {
    console.error('Frontend API Error - createCourseThumbnailIdea:', error.response ? error.response.data : error.message);
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