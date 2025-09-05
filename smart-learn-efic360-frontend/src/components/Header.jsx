// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import eficLogo from "../images/efic-icon-512.png"; 

const Header = ({ onToggleSidebar, user }) => {
  const [open, setOpen] = useState(false);
  const [imgOk, setImgOk] = useState(Boolean(user?.profilePic || user?.avatarUrl || user?.photoURL));
  const [logoOk, setLogoOk] = useState(true);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Derive display info
  const displayName = user?.fullName || user?.name || user?.username || "Student";
  const avatarUrl   = user?.profilePic || user?.avatarUrl || user?.photoURL;

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Close on outside click or Esc
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current || !btnRef.current) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <header className="navbar topbar" role="banner">
      {/* Left: mobile sidebar toggle + brand */}
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__iconbtn topbar__menu"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
        >
          <span className="topbar__menu-bars" aria-hidden="true" />
        </button>

        <Link to="/" className="topbar__brand" aria-label="EFIC Home">
          <img
            src={logoOk ? eficLogo : "/favicon.ico"}   // uses imported image; falls back to favicon if it fails
            alt="EFIC logo"
            className="topbar__brand-logo"
            loading="lazy"
            onError={() => setLogoOk(false)}
          />
          <span className="topbar__brand-text">EFIC</span>
        </Link>
      </div>

      {/* Right: profile dropdown */}
      <div className="topbar__right" ref={menuRef}>
        <button
          ref={btnRef}
          type="button"
          className="topbar__profile"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          {avatarUrl && imgOk ? (
            <img
              className="topbar__avatar-img"
              src={avatarUrl}
              alt={`${displayName} avatar`}
              onError={() => setImgOk(false)}
            />
          ) : (
            <span className="topbar__avatar" aria-hidden="true">{initials}</span>
          )}
          <span className="topbar__user">{displayName}</span>
          <i className={`ti-angle-${open ? "up" : "down"}`} aria-hidden="true" />
        </button>

        <ul className={`dropdown-menu ${open ? "show" : ""}`} role="menu" aria-label="Profile">
          <li role="none">
            <Link role="menuitem" to="/change-password" className="dropdown-item" onClick={() => setOpen(false)}>
              Change Password
            </Link>
          </li>
          <li role="none">
            <Link role="menuitem" to="/logout" className="dropdown-item" onClick={() => setOpen(false)}>
              Log Out
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
