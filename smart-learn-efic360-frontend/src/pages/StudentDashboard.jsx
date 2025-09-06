// src/pages/StudentDashboard.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  ""; // "" assumes a dev proxy from /api → backend
// e.g. set VITE_API_BASE_URL="http://localhost:5000" in .env if no proxy

const FEATURES = [
  { title: "My Profile",           icon: "fa-smile-o",      path: "/ProfileView",              c: "text-primary" },
  // { title: "Progress Tracking",    icon: "fa-bar-chart",    path: "/progress",                 c: "text-success" },
  { title: "Student Library",      icon: "fa-paperclip",    path: "/StudentLibrary",           c: "text-primary" },
  { title: "Chat with MUNIMA",     icon: "fa-comment",      path: "/chatbot",                  c: "text-warning" },
  // { title: "Badges & Rewards",     icon: "fa-trophy",       path: "/BadgeSystemPage",          c: "text-danger" },
  // { title: "Adaptive Quizzes",     icon: "fa-puzzle-piece", path: "/QuizPlayer",               c: "text-info" },
  // { title: "Offline Learning",     icon: "fa-download",     path: "/OfflineLearning",          c: "text-dark" },
  { title: "StudentChat",          icon: "fa-users",        path: "/chat/student",             c: "text-primary" },
  // { title: "Real-Time Feedback",   icon: "fa-comments",     path: "/FeedbackList",             c: "text-warning" },
  // { title: "Notifications",        icon: "fa-bell",         path: "/NotificationsPage",        c: "text-info" },
  { title: "Performance Analytics",icon: "fa-line-chart",   path: "/PerformanceAnalyticsPage", c: "text-primary" },
];

function getToken() {
  return localStorage.getItem("token"); // adjust if stored differently
}

function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetchError, setFetchError] = useState("");
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const notificationsTilePath = "/NotificationsPage";

  // const fetchUnreadCount = useCallback(async () => {

  //   setFetchError(""); // reset
  //   // ---- AUTH MODE: pick one ----
  //   const token = getToken(); // for JWT header mode
  //   // const useCookies = true; // set true if you use httpOnly cookies
  //   // -----------------------------

  //   if (!token /* && !useCookies */) {
  //     console.warn("[Unread] No token found; skipping fetch.");
  //     return;
  //   }

  //   if (abortRef.current) abortRef.current.abort();
  //   const ac = new AbortController();
  //   abortRef.current = ac;

  //   const url = `${API_BASE}/api/notifications/unread-count`;
  //   const headers = {};
  //   // JWT header mode:
  //   if (token) headers.Authorization = `Bearer ${token}`;

  //   try {
  //     const res = await fetch(url, {
  //       method: "GET",
  //       headers,
  //       // credentials: useCookies ? "include" : "same-origin",
  //       signal: ac.signal,
  //     });

  //     if (!res.ok) {
  //       const txt = await res.text().catch(() => "");
  //       console.error("[Unread] HTTP", res.status, txt);
  //       setFetchError(`HTTP ${res.status}`);
  //       return;
  //     }

  //     const data = await res.json();
  //     const n = Number(data.count || 0);
  //     setUnreadCount(Number.isFinite(n) ? n : 0);
  //     // helpful debug log while testing:
  //     console.log("[Unread] count =", n);
  //   } catch (e) {
  //     if (e?.name === "AbortError") return;
  //     console.error("[Unread] fetch error:", e);
  //     setFetchError("network");
  //   }
  // }, []);


  // StudentDashboard.jsx — replace ONLY the fetchUnreadCount function

const fetchUnreadCount = useCallback(async () => {
  // If you use a proxy (/api -> backend), API_BASE can be "".
  const API_BASE =
    (import.meta?.env?.VITE_API_BASE_URL || "").replace(/\/+$/, "");
  const url = `${API_BASE}/api/notifications/unread-count`;

  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include", // << send cookies
    });
    if (!res.ok) {
      console.error("[Unread] HTTP", res.status);
      return;
    }
    const data = await res.json();
    setUnreadCount(Number(data.count || 0));
  } catch (e) {
    console.error("[Unread] fetch error:", e);
  }
}, []);


  useEffect(() => {
    setUserData({ name: "Student", profilePic: "/assets/images/profile.jpg" });

    const start = () => {
      fetchUnreadCount();
      timerRef.current = setInterval(fetchUnreadCount, 5000);
    };
    const stop = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = null;
    };

    start();
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [fetchUnreadCount]);

  return (
    <div className="app-shell">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} user={userData}/>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="app-main" role="main" aria-labelledby="pageTitle">

              {/* Tiny floating bell (StudentDashboard-only) */}
        <Link
          to="/StudentLibrary"
          aria-label={`${unreadCount} unread notifications`}
          className="sd-bell"
        >
          <i className="fa fa-bell" aria-hidden="true" />
          {/* Show a tiny red dot when there are unread items */}
          {/* {unreadCount > 0 && <span className="sd-dot" />} */}
          {/* If you prefer a number instead of a dot, replace the line above with: */}
              {unreadCount > 0 && <span className="sd-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
         
      </Link>
        <div className="page-head">
          <h1 id="pageTitle">Student Dashboard</h1>
          {userData && <p className="muted">Welcome back, {userData.name}.</p>}
          {/* tiny debug helper while you test */}
          {fetchError && (
            <small style={{ color: "#d9534f" }}>
              Notifications fetch error: {fetchError}
            </small>
          )}
        </div>

        <div className="dashboard-grid">
          {FEATURES.map((f) => {
            const isNotifications = f.path === notificationsTilePath;
            return (
              <Link
                key={f.path}
                to={f.path}
                className="card-tile"
                aria-label={`${f.title} – Open`}
              >
                <div className="tile-icon" style={{ position: "relative" }}>
                  <span className="fa-stack fa-2x">
                    <i className={`fa fa-square fa-stack-2x ${f.c}`} />
                    <i className={`fa ${f.icon} fa-stack-1x fa-inverse`} />
                  </span>
                  {isNotifications && unreadCount > 0 && (
                    <span className="notif-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <div className="tile-content">
                  <h2 className="tile-title">{f.title}</h2>
                  <span className="tile-link">Open</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      

      <Footer />


      
    </div>
  );
}

export default StudentDashboard;

