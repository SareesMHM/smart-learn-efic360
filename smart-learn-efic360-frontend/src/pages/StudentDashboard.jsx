// src/pages/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const FEATURES = [
  { title: "My Profile",           icon: "fa-smile-o",      path: "/ProfileView",            c: "text-primary" },
  { title: "Progress Tracking",    icon: "fa-bar-chart",    path: "/progress",               c: "text-success" },
  { title: "Student Library",      icon: "fa-paperclip",    path: "/StudentLibrary",         c: "text-primary" },
  { title: "Chat with MUNIMA",     icon: "fa-comment",      path: "/chatbot",                c: "text-warning" },
  { title: "Badges & Rewards",     icon: "fa-trophy",       path: "/BadgeSystemPage",        c: "text-danger" },
  { title: "Adaptive Quizzes",     icon: "fa-puzzle-piece", path: "/QuizPlayer",             c: "text-info" },
  { title: "Offline Learning",     icon: "fa-download",     path: "/OfflineLearning",        c: "text-dark" },
  { title: "Mentor Access",        icon: "fa-users",        path: "/MentorList",             c: "text-primary" },
  { title: "Real-Time Feedback",   icon: "fa-comments",     path: "/FeedbackList",           c: "text-warning" },
  { title: "Notifications",        icon: "fa-bell",         path: "/NotificationsPage",      c: "text-info" },
  { title: "Performance Analytics",icon: "fa-line-chart",   path: "/PerformanceAnalyticsPage", c: "text-primary" },
];

function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Mock user until wired to real auth/profile
    setUserData({ name: "Student", profilePic: "/assets/images/profile.jpg" });
  }, []);

  return (
    <div className="app-shell">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <main className="app-main" role="main" aria-labelledby="pageTitle">
        <div className="page-head">
          <h1 id="pageTitle">Student Dashboard</h1>
          {userData && (
            <p className="muted">Welcome back, {userData.name}.</p>
          )}
        </div>

        {/* Tiles Grid */}
        <div className="dashboard-grid">
          {FEATURES.map((f) => (
            <Link
              key={f.path}
              to={f.path}
              className="card-tile"
              aria-label={`${f.title} – Open`}
            >
              <div className="tile-icon">
                <span className="fa-stack fa-2x">
                  <i className={`fa fa-square fa-stack-2x ${f.c}`} />
                  <i className={`fa ${f.icon} fa-stack-1x fa-inverse`} />
                </span>
              </div>
              <div className="tile-content">
                <h2 className="tile-title">{f.title}</h2>
                <span className="tile-link">Open</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StudentDashboard;
