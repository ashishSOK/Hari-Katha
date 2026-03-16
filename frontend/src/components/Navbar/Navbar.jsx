import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBookmark, FaHistory, FaUserCircle, FaSignOutAlt, FaChalkboardTeacher, FaUpload, FaHome } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          Hari <span>Katha</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link"><FaHome className="nav-icon" /> <span>Home</span></Link>
          {userInfo && (
            <>
              <Link to="/bookmarks" className="nav-link"><FaBookmark className="nav-icon" /> <span>Saved</span></Link>
              <Link to="/history" className="nav-link"><FaHistory className="nav-icon" /> <span>History</span></Link>

              {(userInfo.isAdmin || userInfo.role === 'mentor') && (
                <Link to="/admin" className="nav-link"><FaUpload className="nav-icon" /> <span>Upload</span></Link>
              )}

              {userInfo.role === 'mentor' && (
                <Link to="/mentor" className="nav-link"><FaChalkboardTeacher className="nav-icon" /> <span>Dashboard</span></Link>
              )}
            </>
          )}

          {userInfo ? (
            <button onClick={handleLogout} className="nav-btn-login logout">
              <FaSignOutAlt /> <span className="auth-text">Logout</span>
            </button>
          ) : (
            <Link to="/login" className="nav-btn-login"><FaUserCircle /> <span className="auth-text">Login</span></Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
