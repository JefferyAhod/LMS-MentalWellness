// src/api/student.js
import API from "./axios";

export const getStudentProfile = async () => {
  const res = await API.get("/student/profile");
  return res.data;
};

export const updateStudentProfile = async (data) => {
  const res = await API.put("/student/profile", data);
  return res.data;
};

export const completeStudentOnboarding = async (data) => {
  const res = await API.post("/student/onboarding", data);
  return res.data;
};

export const enrollInCourse = async (courseId) => {
  const res = await API.post("/student/enroll", { courseId });
  return res.data;
};

export const getStudentCourses = async () => {
  const res = await API.get("/student/courses");
  return res.data;
};

export const getLearningProgress = async () => {
  const res = await API.get("/student/progress");
  return res.data;
};
