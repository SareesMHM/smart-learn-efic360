import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar app-aside" id="sidebar">
      <div className="sidebar-container perfect-scrollbar">
        <nav>
          {/* Main Navigation Menu */}
          <div className="navbar-title">
            <span>Main Navigation</span>
          </div>
          <ul className="main-navigation-menu">
            {/* Dashboard */}
            <li>
              <Link to="/dashboard">
                <div className="item-content">
                  <div className="item-media">
                    <i className="ti-home"></i>
                  </div>
                  <div className="item-inner">
                    <span className="title"> Dashboard </span>
                  </div>
                </div>
              </Link>
            </li>

            {/* Assignments */}
            <li>
              <Link to="/assignments">
                <div className="item-content">
                  <div className="item-media">
                    <i className="ti-pencil-alt"></i>
                  </div>
                  <div className="item-inner">
                    <span className="title"> Assignments </span>
                  </div>
                </div>
              </Link>
            </li>

            {/* Courses */}
            <li>
              <Link to="/courses">
                <div className="item-content">
                  <div className="item-media">
                    <i className="ti-book"></i>
                  </div>
                  <div className="item-inner">
                    <span className="title"> Courses </span>
                  </div>
                </div>
              </Link>
            </li>

            {/* Profile */}
            <li>
              <Link to="/profile">
                <div className="item-content">
                  <div className="item-media">
                    <i className="ti-user"></i>
                  </div>
                  <div className="item-inner">
                    <span className="title"> Profile </span>
                  </div>
                </div>
              </Link>
            </li>

            {/* Notifications (if applicable) */}
            <li>
              <Link to="/notifications">
                <div className="item-content">
                  <div className="item-media">
                    <i className="ti-bell"></i>
                  </div>
                  <div className="item-inner">
                    <span className="title"> Notifications </span>
                  </div>
                </div>
              </Link>
            </li>

            {/* Contact Us */}
            <li>
              <Link to="/contact">
                <div className="item-content">
                  <div className="item-media">
                    <i className="ti-envelope"></i>
                  </div>
                  <div className="item-inner">
                    <span className="title"> Contact Us </span>
                  </div>
                </div>
              </Link>
            </li>

            {/* Logout */}
            <li>
              <Link to="/logout">
                <div className="item-content">
                  <div className="item-media">
                    <i className="ti-power-off"></i>
                  </div>
                  <div className="item-inner">
                    <span className="title"> Logout </span>
                  </div>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
