import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import '../styles/TeacherDashboard.scss'; // Your updated SCSS for styling

const TeacherDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [quizData, setQuizData] = useState({
    totalQuizzes: 0,
    totalCompleted: 0,
  });
  const [attendanceData, setAttendanceData] = useState({ total: 0, present: 0 });

  // Simulate fetching teacher's student data, quiz, attendance data
  useEffect(() => {
    // Fetch student progress and performance data from an API or mock data
    setUserData({
      name: 'John Doe',
      profilePic: 'assets/images/teacher-profile.jpg',
    });

    // Mock student data (could come from an API)
    setStudentData([
      { name: 'Student 1', progress: 80, grade: 'A' },
      { name: 'Student 2', progress: 65, grade: 'B' },
      { name: 'Student 3', progress: 90, grade: 'A+' },
    ]);

    // Mock quiz data
    setQuizData({
      totalQuizzes: 10,
      totalCompleted: 7,
    });

    // Mock attendance data
    setAttendanceData({
      total: 30,
      present: 28,
    });
  }, []);

  // Performance Analytics Chart Data
  const performanceChartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        label: 'Quiz Completion Status',
        data: [quizData.totalCompleted, quizData.totalQuizzes - quizData.totalCompleted],
        backgroundColor: ['#3498db', '#95a5a6'],
        borderColor: ['#2980b9', '#7f8c8d'],
        borderWidth: 1,
      },
    ],
  };

  // Attendance Chart Data
  const attendanceChartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        label: 'Attendance',
        data: [attendanceData.present, attendanceData.total - attendanceData.present],
        backgroundColor: ['#2ecc71', '#e74c3c'],
        borderColor: ['#27ae60', '#c0392b'],
        borderWidth: 1,
      },
    ],
  };

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
                  {userData?.name || 'Teacher'}
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
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        <div className="wrap-content container" id="container">
          {/* Page Title */}
          <section id="page-title">
            <div className="row">
              <div className="col-sm-8">
                <h1 className="mainTitle">Teacher Dashboard</h1>
              </div>
              <ol className="breadcrumb">
                <li><span>Teacher</span></li>
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
                      <Link to="/edit-profile">Update Profile</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Management */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-success"></i>
                      <i className="fa fa-users fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Student Management</h2>
                    <p className="links cl-effect-1">
                      <Link to="/student-management">Manage Students</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Lesson Management */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-warning"></i>
                      <i className="fa fa-book fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Lesson Management</h2>
                    <p className="links cl-effect-1">
                      <Link to="/lesson-management">Manage Lessons</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quiz & Assignment Creation */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-info"></i>
                      <i className="fa fa-pencil fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Quiz Creation</h2>
                    <p className="links cl-effect-1">
                      <Link to="/quiz-creation">Create Quiz</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback & Grading */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-danger"></i>
                      <i className="fa fa-graduation-cap fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Feedback & Grading</h2>
                    <p className="links cl-effect-1">
                      <Link to="/feedback">Grade Assignments</Link>
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
                      <Link to="/performance-analytics">View Performance</Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Tracking */}
              <div className="col-sm-4">
                <div className="panel panel-white no-radius text-center">
                  <div className="panel-body">
                    <span className="fa-stack fa-2x">
                      <i className="fa fa-square fa-stack-2x text-success"></i>
                      <i className="fa fa-calendar-check fa-stack-1x fa-inverse"></i>
                    </span>
                    <h2 className="StepTitle">Attendance Tracking</h2>
                    <p className="links cl-effect-1">
                      <Link to="/attendance-tracking">Track Attendance</Link>
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

export default TeacherDashboard;
