import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="navbar navbar-default navbar-static-top">
      {/* Navbar Header */}
      <div className="navbar-header">
        <a
          href="#"
          className="sidebar-mobile-toggler pull-left hidden-md hidden-lg"
          data-toggle-class="app-slide-off"
          data-toggle-target="#app"
          data-toggle-click-outside="#sidebar"
        >
          <i className="ti-align-justify"></i>
        </a>
        <a className="navbar-brand" href="#">
          <h2 style={{ paddingTop: '20%', color: '#000' }}>Smart Learn EFIC 360</h2>
        </a>
        <a
          href="#"
          className="sidebar-toggler pull-right visible-md visible-lg"
          data-toggle-class="app-sidebar-closed"
          data-toggle-target="#app"
        >
          <i className="ti-align-justify"></i>
        </a>
        <a
          className="pull-right menu-toggler visible-xs-block"
          id="menu-toggler"
          data-toggle="collapse"
          href=".navbar-collapse"
        >
          <span className="sr-only">Toggle navigation</span>
          <i className="ti-view-grid"></i>
        </a>
      </div>

      {/* Navbar Collapse */}
      <div className="navbar-collapse collapse">
        <ul className="nav navbar-right">
          {/*  Management System Title */}
          <li style={{ paddingTop: '2%' }}>
            <h2>Smart Learn EFIC 360</h2>
          </li>

          {/* User Dropdown */}
          <li className="dropdown current-user">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown">
              <img src="assets/images/images.jpg" alt="User Profile" />
              <span className="username">
                Admin
                <i className="ti-angle-down"></i>
              </span>
            </a>
            <ul className="dropdown-menu dropdown-dark">
              <li>
                <Link to="/change-password">
                  Change Password
                </Link>
              </li>
              <li>
                <Link to="/logout">
                  Log Out
                </Link>
              </li>
            </ul>
          </li>
        </ul>

        {/* Menu Toggler for Mobile Devices */}
        <div className="close-handle visible-xs-block menu-toggler" data-toggle="collapse" href=".navbar-collapse">
          <div className="arrow-left"></div>
          <div className="arrow-right"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
