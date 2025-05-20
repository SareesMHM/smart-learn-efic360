// src/services/GradeClassManagerService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/grades';

//  Get all grades
const getAllGrades = async () => {
  const res = await axios.get(API_BASE);
  return res.data.grades;
};

// Create a new grade/class
const createGrade = async (gradeData) => {
  const res = await axios.post(API_BASE, gradeData);
  return res.data;
};

// Update a grade/class
const updateGrade = async (id, gradeData) => {
  const res = await axios.put(`${API_BASE}/${id}`, gradeData);
  return res.data;
};

//  Delete a grade/class
const deleteGrade = async (id) => {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
};

//  Get all teachers for assignment dropdown (optional)
const getAllTeachers = async () => {
  const res = await axios.get('http://localhost:5000/api/users?role=teacher');
  return res.data.users;
};

export default {
  getAllGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  getAllTeachers,
};
