import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="navbar navbar-default navbar-static-top" style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Left: Title */}
      <div>
        <h2 style={{ margin: 0, color: '#000' }}>EFIC</h2>
      </div>

      {/* Right: Profile dropdown */}
      <div className="dropdown current-user">
        <a href="#" className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#000' }}>
          <span>
            Admin <i className="ti-angle-down"></i>
          </span>
        </a>
        <ul className="dropdown-menu dropdown-dark animated fadeInDown" style={{ right: 0, left: 'auto' }}>
          <li>
            <Link to="/logout" className="dropdown-item">Log Out</Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
