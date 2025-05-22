// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';


function AdminDashboard() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Simulated admin user data
    setUserData({
      name: 'Admin User',
      profilePic: '../Admin/images/sa343.jpg',
    });
  }, []);

  return (
    <div className="app-content">
      <Header />
      <Sidebar />
      

      <div className="main-content">
        <div className="wrap-content container" id="container">
          

          <div className="container-fluid container-fullw bg-white">
            <div className="row">
              {[
                { title: 'User Management', icon: 'fa-users', path: '/Admin/UserManagement' },
                { title: 'Teacher Approvals', icon: 'fa-check', path: '/Admin/approvals' },
                { title: 'Student Enrollments', icon: 'fa-user-graduate', path: '/Admin/students' },
                { title: 'Course Management', icon: 'fa-book', path: '/Admin/CourseManager' },
                { title: 'ContentManager', icon: 'fa-book', path: '/Admin/ContentManager' },
                { title: 'GradeClassManager', icon: 'fa-book', path: '/Admin/GradeClassManager' },
                { title: 'Feedback', icon: 'fa-book', path: '/Admin/Feedback' },
                { title: 'Reports & Analytics', icon: 'fa-chart-bar', path: '/Admin/ReportAnalytics' },
                { title: 'VerificationCenter', icon: 'fa-chart-bar', path: '/Admin/VerificationCenter' },
                { title: 'Notifications', icon: 'fa-bell', path: '/Admin/notifications' },
                { title: 'System Settings', icon: 'fa-cogs', path: '/Admin/settings' },
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
      <Footer />


    </div>
  );
}

export default AdminDashboard;
