// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminDashboard.scss';

const AdminDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Simulated admin user data
    setUserData({
      name: 'Admin User',
      profilePic: 'assets/images/admin-profile.jpg',
    });
  }, []);

  return (
    <div className="app-content">
      <header className="navbar navbar-default navbar-static-top">
        <div className="navbar-header">
          <a className="navbar-brand" href="#">
            <h2 style={{ paddingTop: '20%', color: '#000' }}>Smart Learn EFIC 360</h2>
          </a>
        </div>
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-right">
            <li style={{ paddingTop: '2%' }}>
              <h2>Admin Dashboard</h2>
            </li>
            <li className="dropdown current-user">
              <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                <img src={userData?.profilePic || 'assets/images/profile.jpg'} alt="User Profile" />
                <span className="username">
                  {userData?.name || 'Admin'}
                  <i className="ti-angle-down"></i>
                </span>
              </a>
              <ul className="dropdown-menu dropdown-dark">
                <li><Link to="/change-password">Change Password</Link></li>
                <li><Link to="/logout">Log Out</Link></li>
              </ul>
            </li>
          </ul>
        </div>
      </header>

      <div className="main-content">
        <div className="wrap-content container" id="container">
          <section id="page-title">
            <div className="row">
              <div className="col-sm-8">
                <h1 className="mainTitle">Admin Dashboard</h1>
              </div>
              <ol className="breadcrumb">
                <li><span>Admin</span></li>
                <li className="active"><span>Dashboard</span></li>
              </ol>
            </div>
          </section>

          <div className="container-fluid container-fullw bg-white">
            <div className="row">
              {[
                { title: 'User Management', icon: 'fa-users', path: '/admin/users' },
                { title: 'Teacher Approvals', icon: 'fa-check', path: '/admin/approvals' },
                { title: 'Student Enrollments', icon: 'fa-user-graduate', path: '/admin/students' },
                { title: 'Course Management', icon: 'fa-book', path: '/admin/courses' },
                { title: 'Reports & Analytics', icon: 'fa-chart-bar', path: '/admin/reports' },
                { title: 'Notifications', icon: 'fa-bell', path: '/admin/notifications' },
                { title: 'System Settings', icon: 'fa-cogs', path: '/admin/settings' },
              ].map((feature, idx) => (
                <div className="col-sm-4" key={idx}>
                  <div className="panel panel-white no-radius text-center">
                    <div className="panel-body">
                      <span className="fa-stack fa-2x">
                        <i className="fa fa-square fa-stack-2x text-primary"></i>
                        <i className={`fa ${feature.icon} fa-stack-1x fa-inverse`}></i>
                      </span>
                      <h2 className="StepTitle">{feature.title}</h2>
                      <p className="links cl-effect-1">
                        <Link to={feature.path}>Manage</Link>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Smart Learn EFIC 360 | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
