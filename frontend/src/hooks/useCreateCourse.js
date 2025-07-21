import { useState, useCallback } from 'react';
import { createCourse as createCourseApi } from '@/api/educator'; 
import { toast } from 'react-toastify'; 

export const useCreateCourse = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const createCourse = useCallback(async (courseData) => {
    setIsCreating(true);
    setError(null); // Clear previous errors

    try {
      const response = await createCourseApi(courseData);
      return response; // Return the created course data
    } catch (err) {
      console.error("Error in useCreateCourse hook:", err);
      const errorMessage = err?.response?.data?.message || 'Failed to create course. Please try again.';
      toast.error(errorMessage);
      setError(err); 
      return null; 
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createCourse, isCreating, error };
};