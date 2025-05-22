// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './features/adminSlice'; // Update path if needed

const store = configureStore({
  reducer: {
    adminState: adminReducer, // Replace or extend as needed
  },
});

export default store;
