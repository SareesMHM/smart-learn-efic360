import { NavLink } from "react-router-dom";

const links = [
  { to: "/Admin/AdminDashboard", icon: "ti-home", label: "Admin Dashboard" },
  { to: "/Admin/AdminRegisterUserForm", icon: "ti-pencil-alt", label: "Add User" },
  { to: "/Admin/CourseManager", icon: "ti-book", label: "Add Course" },
  { to: "/profile", icon: "ti-user", label: "Profile" },
  { to: "/notifications", icon: "ti-bell", label: "Notifications" },
  { to: "/contact", icon: "ti-envelope", label: "Contact Us" },
  { to: "/logout", icon: "ti-power-off", label: "Logout" },
];

const Sidebar = ({ isOpen, onClose }) => {
  // Close on link click (useful on mobile)
  const handleLinkClick = () => {
    if (onClose) onClose();
    // If you're toggling with a CSS class on #sidebar:
    // document.getElementById("sidebar")?.classList.remove("open");
    // document.querySelector(".sidebar-backdrop")?.classList.remove("show");
  };

  return (
    <>
      {/* Backdrop for mobile (toggle .show externally with your header button) */}
      <div
        className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`sidebar app-aside ${isOpen ? "open" : ""}`} id="sidebar" role="navigation" aria-label="Main Navigation">
        <div className="sidebar-container perfect-scrollbar">
          <nav>
            <div className="navbar-title" aria-hidden="true">
              <i className="ti-menu" style={{ marginRight: 0 }} />
              <span>Main Navigation</span>
            </div>

            <ul className="main-navigation-menu">
              {links.map(({ to, icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={handleLinkClick}
                  >
                    <div className="item-content">
                      <div className="item-media">
                        <i className={icon} />
                      </div>
                      <div className="item-inner">
                        <span className="title">{label}</span>
                      </div>
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
