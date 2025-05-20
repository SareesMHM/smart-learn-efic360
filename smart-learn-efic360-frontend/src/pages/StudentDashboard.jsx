import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import '../components/AppLayout';

const StudentDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [progressData, setProgressData] = useState({
    quizzesCompleted: 0,
    lessonsCompleted: 0,
    badgesEarned: 0,
  });

  useEffect(() => {
    // Call your backend API to fetch user data (mocked here)
    // Example: fetchUserData().then(data => setUserData(data));
    
    setUserData({
      username: 'Student',
      profilePic: 'assets/images/profile.jpg',
    });

    // Mock progress data
    setProgressData({
      quizzesCompleted: 5,
      lessonsCompleted: 8,
      badgesEarned: 3,
    });
  }, []);

  return (
    <div className="app-content">
      {/* Header Section */}
      <header className="navbar navbar-default navbar-static-top">
        <div className="navbar-header">
          <a href="#" className="sidebar-mobile-toggler pull-left hidden-md hidden-lg">
            <i className="ti-align-justify"></i>
          </a>
          <a className="navbar-brand" href="#">
            <h2 style={{ paddingTop: '20%', color: '#000' }}>Smart Learn EFIC 360</h2>
          </a>
          <a href="#" className="sidebar-toggler pull-right visible-md visible-lg">
            <i className="ti-align-justify"></i>
          </a>
          <a className="pull-right menu-toggler visible-xs-block" id="menu-toggler" data-toggle="collapse" href=".navbar-collapse">
            <span className="sr-only">Toggle navigation</span>
            <i className="ti-view-grid"></i>
          </a>
        </div>
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-right">
            <li style={{ paddingTop: '2%' }}>
              <h2>Smart Learn EFIC 360</h2>
            </li>
            <li className="dropdown current-user">
              <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                <img src={userData?.profilePic || 'assets/images/profile.jpg'} alt="User Profile" />
                <span className="username">
                  {userData?.username || 'Admin'}
                  <i className="ti-angle-down"></i>
                </span>
              </a>
              <ul className="dropdown-menu dropdown-dark">
                <li>
                  <Link to="/change-password">Change Password</Link>
                </li>
                <li>
                  <Link to="/logout">Log Out</Link>
                </li>
              </ul>
            </li>
          </ul>
          <div className="close-handle visible-xs-block menu-toggler" data-toggle="collapse" href=".navbar-collapse">
            <div className="arrow-left"></div>
            <div className="arrow-right"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        <div className="wrap-content container" id="container">
          {/* Page Title */}
          <section id="page-title">
            <div className="row">
              <div className="col-sm-8">
                <h1 className="mainTitle">Student Dashboard</h1>
              </div>
              <ol className="breadcrumb">
                <li><span>Student</span></li>
                <li className="active"><span>Dashboard</span></li>
              </ol>
            </div>
          </section>

          {/* Dashboard Content */}
          <div className="container-fluid container-fullw bg-white">
            <div className="row">
              {/* My Profile */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-primary"></i>
                      <i className="fa fa-smile-o fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">My Profile</h2>
                    <p className="links cl-effect-1">
                      <Link to="/ProfileView">View Profile</Link>
                      <Link to="/ProfileEdit">Update Profile</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-success"></i>
                      <i className="fa fa-bar-chart fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Progress Tracking</h2>
                    <p className="links cl-effect-1">
                      <Link to="/progress">View Progress</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* My Bookings */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-primary"></i>
                      <i className="fa fa-paperclip fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">My Bookings</h2>
                    <p className="cl-effect-1">
                      <Link to="/appointment-history">View Booking History</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Smart AI Chatbot */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-warning"></i>
                      <i className="fa fa-comment fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Chat with MUNIMA</h2>
                    <p className="links cl-effect-1">
                      <Link to="/chatbot">Start Chat</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Badge & Reward System */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-danger"></i>
                      <i className="fa fa-trophy fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Badges & Rewards</h2>
                    <p className="links cl-effect-1">
                      <Link to="/BadgeSystemPage">View Badges</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Adaptive Learning Quizzes */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-info"></i>
                      <i className="fa fa-puzzle-piece fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Adaptive Quizzes</h2>
                    <p className="links cl-effect-1">
                      <Link to="/AdaptiveQuizPage">Start Quiz</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Offline Learning Support */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-dark"></i>
                      <i className="fa fa-download fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Offline Learning</h2>
                    <p className="links cl-effect-1">
                      <Link to="/OfflineLearning">Download Resources</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Mentor Access */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-primary"></i>
                      <i className="fa fa-users fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Mentor Access</h2>
                    <p className="links cl-effect-1">
                      <Link to="/MentorList">Contact Mentor</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-Time Feedback */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-warning"></i>
                      <i className="fa fa-comments fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Real-Time Feedback</h2>
                    <p className="links cl-effect-1">
                      <Link to="/FeedbackList">Provide Feedback</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Notifications & Announcements */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-info"></i>
                      <i className="fa fa-bell fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Notifications</h2>
                    <p className="links cl-effect-1">
                      <Link to="/NotificationsPage">Check Notifications</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Analytics */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-primary"></i>
                      <i className="fa fa-line-chart fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Performance Analytics</h2>
                    <p className="links cl-effect-1">
                      <Link to="/PerformanceAnalyticsPage">View Performance</Link>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Smart Learn EFIC 360 | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
