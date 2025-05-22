
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';


const ParentDashboard = () => {
  return (
    <div className="app-content">
      <Header />
      <Sidebar />

      <div className="main-content">
        <div className="dashboard-header">
          <h2>Welcome, Parent</h2>
          <p>Monitor your child’s performance and activities</p>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3>Attendance</h3>
            <p>View your child's attendance records</p>
          </div>
          <div className="card">
            <h3>Grades</h3>
            <p>Review academic performance by subject</p>
          </div>
          <div className="card">
            <h3>Notices</h3>
            <p>Stay informed on school announcements</p>
          </div>
          <div className="card">
            <h3>Communication</h3>
            <p>Contact teachers or receive feedback</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ParentDashboard;
