import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const Header = ({ onToggleSidebar }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click or Esc
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current || !btnRef.current) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
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
          {/* hamburger */}
          <span className="topbar__menu-bars" aria-hidden="true" />
        </button>

        <Link to="/" className="topbar__brand" aria-label="EFIC Home">
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
          onClick={() => setOpen((v) => !v)}
        >
          <span className="topbar__avatar" aria-hidden="true">A</span>
          <span className="topbar__user">Admin</span>
          <i className={`ti-angle-${open ? "up" : "down"}`} aria-hidden="true" />
        </button>

        <ul
          className={`dropdown-menu ${open ? "show" : ""}`}
          role="menu"
          aria-label="Profile"
        >
          <li role="none">
            <Link role="menuitem" to="/logout" className="dropdown-item">
              Log Out
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
