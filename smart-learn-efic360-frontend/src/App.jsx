// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';

import ChatbotPage from './pages/ChatbotPage';
import RecommendationPage from './pages/RecommendationPage';
import BehavioralAnalyticsPage from './pages/BehavioralAnalyticsPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import TeacherSupportPage from './pages/TeacherSupportPage';
import AdaptiveFlowPage from './pages/AdaptiveFlowPage';
import ModelTrainingDashboard from './pages/ModelTrainingDashboard';

import './styles/main.scss';
import './styles/Sidebar.scss';
import './styles/header.scss';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registration" element={<RegistrationPage />} />
      
      {/* AI powered pages */}
      <Route path="/chatbot" element={<ChatbotPage />} />
      <Route path="/recommendations" element={<RecommendationPage />} />
      <Route path="/analytics" element={<BehavioralAnalyticsPage />} />
      <Route path="/session-summary" element={<SessionSummaryPage />} />
      <Route path="/teacher-support" element={<TeacherSupportPage />} />
      <Route path="/adaptive-flow" element={<AdaptiveFlowPage />} />
      <Route path="/model-training" element={<ModelTrainingDashboard />} />
      
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App;
