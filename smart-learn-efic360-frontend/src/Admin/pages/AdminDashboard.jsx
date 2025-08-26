import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const FEATURES = [
  { title: "User Management",       icon: "fa-users",        path: "/Admin/UserManagement" },
  { title: "Teacher Approvals",     icon: "fa-check",        path: "/Admin/approvals" },
  { title: "Student Enrollments",   icon: "fa-user-graduate",path: "/Admin/students" },
  { title: "Course Management",     icon: "fa-book",         path: "/Admin/CourseManager" },
  { title: "ContentManager",        icon: "fa-book",         path: "/Admin/ContentManager" },
  { title: "GradeClassManager",     icon: "fa-book",         path: "/Admin/GradeClassManager" },
  { title: "Feedback",              icon: "fa-comment",      path: "/Admin/Feedback" },
  { title: "Reports & Analytics",   icon: "fa-chart-bar",    path: "/Admin/ReportAnalytics" },
  { title: "VerificationCenter",    icon: "fa-shield-check", path: "/Admin/VerificationCenter" },
  { title: "Notifications",         icon: "fa-bell",         path: "/Admin/notifications" },
  { title: "System Settings",       icon: "fa-cogs",         path: "/Admin/settings" },
];

function AdminDashboard() {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setUserData({ name: "Admin User", profilePic: "/Admin/images/sa343.jpg" });
  }, []);

  return (
    <div className="app-shell">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <main className="app-main" role="main" aria-labelledby="pageTitle">
        <div className="page-head">
          <h1 id="pageTitle">Admin Dashboard</h1>
          {userData && (
            <p className="muted">Welcome back, {userData.name.split(" ")[0]}.</p>
          )}
        </div>

        {/* Tiles Grid */}
        <div className="dashboard-grid">
          {FEATURES.map((f) => (
            <Link key={f.path} to={f.path} className="card-tile" aria-label={`${f.title} – Manage`}>
              <div className="tile-icon">
                <span className="fa-stack fa-2x">
                  <i className="fa fa-square fa-stack-2x text-primary" />
                  <i className={`fa ${f.icon} fa-stack-1x fa-inverse`} />
                </span>
              </div>
              <div className="tile-content">
                <h2 className="tile-title">{f.title}</h2>
                <span className="tile-link">Manage</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
