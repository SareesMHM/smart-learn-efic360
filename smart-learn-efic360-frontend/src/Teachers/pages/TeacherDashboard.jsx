import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const FEATURES = [
  { title: "View Profile",            icon: "fa-id-badge",        path: "/ProfileView" },
  { title: "Update Profile",            icon: "fa-id-badge",        path: "/ProfileEdit" },
  { title: "Student Management",    icon: "fa-users",           path: "/teacher/students" },
  { title: "Lesson Management",     icon: "fa-book",            path: "/teacher/lessons" },
 { title: "ContentManagerT",        icon: "fa-book",         path: "/Teachers/ContentManagerT" },
  { title: "Assignments",           icon: "fa-file-alt",        path: "/teacher/assignments" },
  { title: "Feedback & Grading",    icon: "fa-graduation-cap",  path: "/teacher/grading" },
  { title: "Performance Analytics", icon: "fa-line-chart",      path: "/teacher/analytics" },
  { title: "Attendance Tracking",   icon: "fa-calendar-check",  path: "/teacher/attendance" },
  { title: "Materials",             icon: "fa-folder-open",     path: "/teacher/materials" },
 { title: "TeacherChat",       icon: "fa-cogs",         path: "/chat/teacher" },
  { title: "AssignmentSubmissions",       icon: "fa-cogs",         path: "/Admin/AssignmentSubmissions" },
  { title: "QuizResults",       icon: "fa-cogs",         path: "/Admin/QuizResults" },
];

function TeacherDashboard() {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setUserData({ name: "John Doe", profilePic: "/assets/images/teacher-profile.jpg" });
  }, []);

  return (
    <div className="app-shell">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <main className="app-main" role="main" aria-labelledby="pageTitle">
        <div className="page-head">
          <h1 id="pageTitle">Teacher Dashboard</h1>
          {userData && <p className="muted">Welcome back, {userData.name.split(" ")[0]}.</p>}
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
                  <i className="fa fa-square fa-stack-2x text-primary" />
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

export default TeacherDashboard;
