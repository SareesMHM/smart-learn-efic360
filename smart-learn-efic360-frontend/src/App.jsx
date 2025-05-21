
import { Route, Routes } from 'react-router-dom';

import "./App.scss";
import AdaptiveFlowPage from './pages/AdaptiveFlowPage';
import BehavioralAnalyticsPage from './pages/BehavioralAnalyticsPage';
import ChatbotPage from './pages/ChatbotPage';
import LoginPage from './pages/LoginPage';
import ModelTrainingDashboard from './pages/ModelTrainingDashboard';
import RecommendationPage from './pages/RecommendationPage';
import RegistrationPage from './pages/RegistrationPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import TeacherSupportPage from './pages/TeacherSupportPage';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import AttendancePage from './pages/AttendancePage';
import BadgeSystemPage from './pages/BadgeSystemPage';
import AdaptiveQuizPage from './pages/AdaptiveQuizPage';
import PerformanceAnalyticsPage from './pages/PerformanceAnalyticsPage';
import ProfileView from './pages/ProfileView';
import ProfileEdit from './pages/ProfileEdit';
import NotificationsPage from './pages/NotificationsPage';
import FeedbackList from './pages/FeedbackList';
import MentorList from './pages/MentorList';
import TeacherDashboard from './Teachers/pages/TeacherDashboard';
import AdminDashboard from './Admin/pages/AdminDashboard';
import UserManagement from './Admin/pages/UserManagement';
import ParentDashboard from './Parent/pages/ParentDashboard';
import AccessLogViewer from './Admin/pages/AccessLogViewer';

import CourseManager from './Admin/pages/CourseManager';
import AdminRegisterUserForm from './Admin/pages/AdminRegisterUserForm';
import GradeClassManager from './Admin/pages/GradeClassManager';
import ContentManager from './Admin/pages/ContentManager';
import Feedback from './Admin/pages/Feedback';
import ReportAnalytics from './Admin/pages/ReportAnalytics';
import VerificationCenter from './Admin/pages/VerificationCenter';
import OfflineLearning from './pages/OfflineLearning';
import ForgotPassword from './pages/ForgotPassword';

// src/index.js or src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';




function App() {
  return (
       <Routes>
         <Route path="/" element={<Home />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/ProfileEdit" element={<ProfileEdit />} />
          <Route path="/ProfileView" element={<ProfileView />} />
          <Route path="/FeedbackList" element={<FeedbackList />} />
          <Route path="/Teacher/TeacherDashboard" element={<TeacherDashboard />} />
          <Route path="/Parent/ParentDashboard" element={<ParentDashboard />} />
          <Route path="/Admin/VerificationCenter" element={<VerificationCenter />} />
          <Route path="/OfflineLearning" element={<OfflineLearning />} />
          <Route path="/NotificationsPage" element={<NotificationsPage />} />
          <Route path="/Admin/Feedback" element={<Feedback />} />
          <Route path="/MentorList" element={<MentorList />} />
         <Route path="/Admin/ReportAnalytics" element={<ReportAnalytics />} />
         <Route path="/AccessLogViewer" element={<AccessLogViewer />} />
         <Route path="/PerformanceAnalyticsPage" element={<PerformanceAnalyticsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/Admin/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/Admin/AdminRegisterUserForm" element={<AdminRegisterUserForm />} />
        <Route path="/Admin/ContentManager" element={<ContentManager />} />
        <Route path="/Admin/GradeClassManager" element={<GradeClassManager />} />
        <Route path="/Admin/UserManagement" element={<UserManagement />} />
        <Route path="/Admin/CourseManager" element={<CourseManager />} />
        <Route path="/AttendancePage" element={<AttendancePage />} />
        <Route path="/AdaptiveQuizPage" element={<AdaptiveQuizPage />} />
        <Route path="/BadgeSystemPage" element={<BadgeSystemPage />} />
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
