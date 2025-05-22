
import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <div className="home-container">
      {/* Header Section */}
     <header className="home-header">
        <div className="logo">
          <h1>EFIC</h1>
        </div>
        <nav className="header-nav">
          <ul className="nav justify-content-center">
            <li className="nav-item"><a href="#" className="nav-link">Home</a></li>
            <li className="nav-item"><a href="#about_us" className="nav-link">About Us</a></li>
            <li className="nav-item"><a href="#services" className="nav-link">Services</a></li>
            <li className="nav-item"><a href="#gallery" className="nav-link">Gallery</a></li>
            <li className="nav-item"><a href="#contact_us" className="nav-link">Contact</a></li>
            <li className="nav-item"><Link to="/login" className="btn btn-primary">Login</Link></li>
          </ul>
        </nav>
      </header>

      {/* ################# Slider Starts Here ####################### */}
      <div className="slider-detail">
        <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
          <ol className="carousel-indicators">
            <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active"></li>
            <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
          </ol>

          <div className="carousel-inner">
            <div className="carousel-item">
              <img className="d-block w-100" src="src/images/im (3).jpg" alt="Slide 1" />
              <div className="carousel-cover"></div>
              <div className="carousel-caption">
                <h5>Smart Learn EFIC 360</h5>
              </div>
            </div>

            <div className="carousel-item active">
              <img className="d-block w-100" src="src/images/im (4).jpg" alt="Slide 2" />
              <div className="carousel-cover"></div>
              <div className="carousel-caption">
                <h5>Smart Learn EFIC 360</h5>
              </div>
            </div>
          </div>

          <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="sr-only">Previous</span>
          </a>
          <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="sr-only">Next</span>
          </a>
        </div>
      </div>

   

      {/* About Us Section */}
      <section id="about_us" className="about-us">
        
        <div className="about-img">
          <img src="src/images/im (1).jpg" alt="About Us" />
        </div>
        <div className="about-text">
          <h3>About Smart Learn EFIC 360</h3>
          <p>Smart Learn EFIC 360 is an AI-powered adaptive learning platform tailored to meet the diverse learning needs of students. Our platform offers personalized lessons, real-time behavioral analytics, and dynamic quizzes to enhance learning engagement.</p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <h3>Our Services</h3>
        <div className="services-list">
          <div className="service-item">
            <i className="icon fas fa-chalkboard-teacher"></i>
            <h4>Interactive Lessons</h4>
            <p>Engage with interactive lessons personalized to your learning pace and style.</p>
          </div>
          <div className="service-item">
            <i className="icon fas fa-robot"></i>
            <h4>AI Chatbot Support</h4>
            <p>Get real-time assistance and feedback from Muṉimā, your AI-powered tutor.</p>
          </div>
          <div className="service-item">
            <i className="icon fas fa-award"></i>
            <h4>Badges & Rewards</h4>
            <p>Earn badges and rewards as you progress through your learning journey.</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-images">
          <img src="https://via.placeholder.com/400x300" alt="Gallery 1" />
          <img src="https://via.placeholder.com/400x300" alt="Gallery 2" />
          <img src="https://via.placeholder.com/400x300" alt="Gallery 3" />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact_us" className="contact">
        <h3>Contact Us</h3>
        <p>If you have any questions, feel free to reach out to us. We’re here to help!</p>
        <Link to="/contact" className="btn-primary">Get in Touch</Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2025 Smart Learn EFIC 360 | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Home;
