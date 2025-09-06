// src/App.jsx
import { Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import './App.scss';

// Core pages
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import EmailVerification from './pages/EmailVerification';
import SendVerification from './pages/SendVerification';
import VerifyingEmail from './pages/VerifyingEmail';
import OfflineLearning from './pages/OfflineLearning';
import ForgotPassword from './pages/ForgotPassword';
import NotificationsPage from './pages/NotificationsPage';
import ProfileView from './pages/ProfileView';
import ProfileEdit from './pages/ProfileEdit';
import StudentDashboard from './pages/StudentDashboard';
import StudentLibrary from './pages/StudentLibrary';
import QuizPlayer from './pages/QuizPlayer';
import QuizResults from './Admin/pages/QuizResults'; // you had this under Admin
import AttendancePage from './pages/AttendancePage';
import AdaptiveQuizPage from './pages/AdaptiveQuizPage';
import BadgeSystemPage from './pages/BadgeSystemPage';
import PerformanceAnalyticsPage from './pages/PerformanceAnalyticsPage';
import AdminChat   from './pages/chat/AdminChat';
import TeacherChat from './pages/chat/TeacherChat';
import ParentChat  from './pages/chat/ParentChat';
import StudentChat from './pages/chat/StudentChat';


// AI features
import AdaptiveFlowPage from './pages/AdaptiveFlowPage';
import BehavioralAnalyticsPage from './pages/BehavioralAnalyticsPage';
import ChatbotPage from './pages/ChatbotPage';
import ModelTrainingDashboard from './pages/ModelTrainingDashboard';
import RecommendationPage from './pages/RecommendationPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import TeacherSupportPage from './pages/TeacherSupportPage';

// Dashboards
import TeacherDashboard from './Teachers/pages/TeacherDashboard';
import AdminDashboard from './Admin/pages/AdminDashboard';
import ParentDashboard from './Parent/pages/ParentDashboard';

// Admin area
import UserManagement from './Admin/pages/UserManagement';
import AccessLogViewer from './Admin/pages/AccessLogViewer';
import AssignmentSubmissions from './Admin/pages/AssignmentSubmissions';
import ReportAnalytics from './Admin/pages/ReportAnalytics';
import VerificationCenter from './Admin/pages/VerificationCenter';
import Verification from './Admin/pages/Verification';
import AdminRegisterUserForm from './Admin/pages/AdminRegisterUserForm';
import GradeClassManager from './Admin/pages/GradeClassManager';
import ContentManager from './Admin/pages/ContentManager';
import CourseManager from './Admin/pages/CourseManager';

// Teacher area
import ContentManagerT from './Teachers/pages/ContentManagerT';

// Parent area
import ParentStudentDetails from './Parent/pages/ParentStudentDetails';



// CSS/JS vendor (Bootstrap)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

/** Simple role guard based on localStorage.role */
function RequireRole({ role, children }) {
  const userRole = localStorage.getItem('role'); // set this at login
  return userRole === role ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <ToastContainer theme="dark" position="bottom-center" />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/EmailVerification" element={<EmailVerification />} />
        <Route path="/SendVerification" element={<SendVerification />} />
        <Route path="/email/verify/:token" element={<VerifyingEmail />} />
        <Route path="/OfflineLearning" element={<OfflineLearning />} />

        {/* Profile & Notifications */}
        <Route path="/ProfileEdit" element={<ProfileEdit />} />
        <Route path="/ProfileView" element={<ProfileView />} />
        <Route path="/NotificationsPage" element={<NotificationsPage />} />

        {/* Student general */}
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/StudentLibrary" element={<StudentLibrary />} />

        {/* Quizzes (keep one QuizPlayer route; you also have dynamic by id) */}
        <Route path="/QuizPlayer" element={<QuizPlayer />} />
        <Route path="/quiz/:id" element={<QuizPlayer />} />
        <Route path="/quiz/:id/results" element={<QuizResults />} />

        {/* Attendance & Gamification */}
        <Route path="/AttendancePage" element={<AttendancePage />} />
        <Route path="/AdaptiveQuizPage" element={<AdaptiveQuizPage />} />
        <Route path="/BadgeSystemPage" element={<BadgeSystemPage />} />
        <Route path="/PerformanceAnalyticsPage" element={<PerformanceAnalyticsPage />} />

        {/* AI-powered pages */}
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/recommendations" element={<RecommendationPage />} />
        <Route path="/analytics" element={<BehavioralAnalyticsPage />} />
        <Route path="/session-summary" element={<SessionSummaryPage />} />
        <Route path="/teacher-support" element={<TeacherSupportPage />} />
        <Route path="/adaptive-flow" element={<AdaptiveFlowPage />} />
        <Route path="/model-training" element={<ModelTrainingDashboard />} />


        
  

        {/* Teacher area */}
        <Route path="/Teacher/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path="/Teachers/ContentManagerT" element={<ContentManagerT />} />

        {/* Parent area */}
        <Route path="/Parent/ParentDashboard" element={<ParentDashboard />} />
        <Route path="/Parent/ParentStudentDetails" element={<ParentStudentDetails />} />

        {/* Admin area */}
        <Route path="/Admin/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/Admin/UserManagement" element={<UserManagement />} />
        <Route path="/Admin/CourseManager" element={<CourseManager />} />
        <Route path="/Admin/ContentManager" element={<ContentManager />} />
        <Route path="/Admin/AccessLogViewer" element={<AccessLogViewer />} />
        <Route path="/Admin/AssignmentSubmissions" element={<AssignmentSubmissions />} />
        <Route path="/Admin/QuizResults" element={<QuizResults />} />
        <Route path="/Admin/VerificationCenter" element={<VerificationCenter />} />
        <Route path="/Admin/Verification" element={<Verification />} />
        <Route path="/Admin/AdminRegisterUserForm" element={<AdminRegisterUserForm />} />
        <Route path="/Admin/GradeClassManager" element={<GradeClassManager />} />
        <Route path="/Admin/ReportAnalytics" element={<ReportAnalytics />} />
        {/* If you later create ApprovalsPage:
            <Route path="/Admin/ApprovalsPage" element={<ApprovalsPage />} />
        */}

        {/* Real-time Chat (role-protected) */}
        <Route
          path="/chat/admin"
          element={
            <RequireRole role="Admin">
              <AdminChat />
            </RequireRole>
          }
        />
        <Route
          path="/chat/teacher"
          element={
            <RequireRole role="Teacher">
              <TeacherChat />
            </RequireRole>
          }
        />
        <Route
          path="/chat/parent"
          element={
            <RequireRole role="Parent">
              <ParentChat />
            </RequireRole>
          }
        />
        <Route
          path="/chat/student"
          element={
            <RequireRole role="Student">
              <StudentChat />
            </RequireRole>
          }
        />

        {/* 404 fallback (optional) */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </>
  );
}
