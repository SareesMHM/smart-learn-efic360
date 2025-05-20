// src/services/courseService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/courses';

const getAllCourses = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

const createCourse = async (courseData) => {
  const res = await axios.post(BASE_URL, courseData);
  return res.data;
};

const updateCourse = async (id, updatedData) => {
  const res = await axios.put(`${BASE_URL}/${id}`, updatedData);
  return res.data;
};

const deleteCourse = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};

export default {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
