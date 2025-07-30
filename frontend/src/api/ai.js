// frontend/src/api/ai.js
// Assuming you have an API instance configured for your backend, e.g., with axios
// For example, if you have a file like `frontend/src/lib/axios.js` that exports an instance:
// import API from './axios'; // Adjust path as needed

// Placeholder for your API instance. Replace with your actual setup.
// If you're using plain fetch or axios directly, adjust accordingly.
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