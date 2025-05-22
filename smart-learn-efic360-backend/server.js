require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Public Routes
// app.use('/auth', require('./routes/authRoutes'));

// API Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api/parent', require('./routes/parentRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));
 // if needed for fallback

// Optional Protected Routes
// const authMiddleware = require('./middlewares/authMiddleware');
// app.use('/chat', authMiddleware, require('./routes/chatRoutes'));
// app.use('/recommendations', authMiddleware, require('./routes/recommendationRoutes'));

// Background Jobs
require('./jobs/remindUnverifiedUsers');

// Mongo Events & Server Start
mongoose.connection.once('open', () => {
  console.log(' Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error(' MongoDB connection error:', err);
});
app.use('/api/admin', require('./routes/adminRoutes'));


module.exports = app;
