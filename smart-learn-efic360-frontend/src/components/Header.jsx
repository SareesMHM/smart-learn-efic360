
import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Header = () => {
   // State for sidebar open/close
  const [sidebarClosed, setSidebarClosed] = useState(false);

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    setSidebarClosed(prev => !prev);

    // Additionally, if your #app container needs a class, toggle it here
    // For example, toggling 'app-sidebar-closed' class on body or #app
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.classList.toggle('app-sidebar-closed');
    }
  };
  return (
    <header className="navbar navbar-default navbar-static-top">
      <div className="navbar-header">
        <button
          type="button"
          className="sidebar-mobile-toggler pull-left hidden-md hidden-lg"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
        >
          <i className="ti-align-justify"></i>
        </button>

        <a className="navbar-brand" href="#">
          <h2 style={{ paddingTop: '5%', color: '#000' }}>EFIC</h2>
        </a>

       

        <button
  type="button"
  className="sidebar-mobile-toggler pull-left hidden-md hidden-lg"
  aria-label="Toggle sidebar"
  onClick={() => {
    
  }}
>
  <i className="ti-align-justify"></i>
</button>
      </div>

      <div className="navbar-collapse collapse">
        <ul className="nav navbar-right">
          <li className="hidden-xs" style={{ paddingTop: '5%' }}>
            <h2>Smart Learn EFIC 360</h2>
          </li>

          <li className="dropdown current-user">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown">
              <img src="" alt="User Profile" />
              <span className="username">
                Student <i className="ti-angle-down"></i>
              </span>
            </a>
            <ul className="dropdown-menu dropdown-dark animated fadeInDown">
              <li>
                <Link to="/change-password">Change Password</Link>
              </li>
              <li>
                <Link to="/logout">Log Out</Link>
              </li>
            </ul>
          </li>
        </ul>

        <div
           className="close-handle visible-xs-block menu-toggler"
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          onKeyPress={e => { if (e.key === 'Enter') toggleSidebar(); }}
        >
          <div className="arrow-left"></div>
          <div className="arrow-right"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
