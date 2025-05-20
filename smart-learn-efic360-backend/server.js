// server.js or app.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
// Connect to MongoDB
connectDB();

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Import routes and middleware
const chatRoutes = require('./routes/chatRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
// ... import other routes

const authMiddleware = require('./middlewares/authMiddleware');

app.use(express.json());
// app.use(errorHandler);
// app.use('/api/', apiLimiter);
app.use('/api/', require("./routes/authRoutes"));



// Public routes
app.use('/auth', require('./routes/authRoutes'));

// Protected routes (add authMiddleware)
// app.use('/chat', authMiddleware, chatRoutes);
// app.use('/recommendations', authMiddleware, recommendationRoutes);
// Add other protected routes similarly

// Optionally, add error handling middleware here


const express = require('express');

const gradeRoutes = require('./routes/gradeRoutes');

// Middleware
app.use(express.json());

// Use the grade routes under this base path
app.use('/api/grades', gradeRoutes);
require('./jobs/remindUnverifiedUsers'); //  Import the job

module.exports = app;
