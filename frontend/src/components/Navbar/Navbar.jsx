import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBookmark, FaHistory, FaUserCircle, FaSignOutAlt, FaChalkboardTeacher, FaUpload, FaHome, FaTags } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* ══ Top Navbar (desktop + mobile top strip) ══ */}
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="nav-logo">
            Hari <span>Katha</span>
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="nav-links">
            <Link to="/" className="nav-link"><FaHome className="nav-icon" /> <span>Home</span></Link>

            {userInfo && (
              <>
                <Link to="/bookmarks" className="nav-link"><FaBookmark className="nav-icon" /> <span>Saved</span></Link>
                <Link to="/history" className="nav-link"><FaHistory className="nav-icon" /> <span>History</span></Link>

                {(userInfo.isAdmin || userInfo.role === 'mentor') && (
                  <>
                    <Link to="/admin" className="nav-link"><FaUpload className="nav-icon" /> <span>Upload</span></Link>
                    <Link to="/categories" className="nav-link"><FaTags className="nav-icon" /> <span>Categories</span></Link>
                  </>
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

          {/* Mobile-only: show profile/login pill in top bar */}
          <div className="mobile-top-right">
            {userInfo ? (
              <div className="profile-dropdown-wrapper" ref={dropdownRef}>
                <button
                  className="mobile-logout-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <FaUserCircle className="mobile-avatar" />
                  <span className="mobile-username">{userInfo.username || 'Me'}</span>
                  <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
                </button>
                {dropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-info">
                      <FaUserCircle className="dropdown-avatar" />
                      <span>{userInfo.username || 'User'}</span>
                    </div>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-btn-login mobile-login-btn">
                <FaUserCircle /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ══ Bottom Tab Bar — mobile only ══ */}
      <nav className="bottom-nav">
        <Link to="/" className={`tab-item ${isActive('/') ? 'active' : ''}`}>
          <span className="tab-icon"><FaHome /></span>
          <span className="tab-label">Home</span>
        </Link>

        {userInfo && (
          <>
            <Link to="/bookmarks" className={`tab-item ${isActive('/bookmarks') ? 'active' : ''}`}>
              <span className="tab-icon"><FaBookmark /></span>
              <span className="tab-label">Saved</span>
            </Link>

            <Link to="/history" className={`tab-item ${isActive('/history') ? 'active' : ''}`}>
              <span className="tab-icon"><FaHistory /></span>
              <span className="tab-label">History</span>
            </Link>

            {(userInfo.isAdmin || userInfo.role === 'mentor') && (
              <>
                <Link to="/admin" className={`tab-item ${isActive('/admin') ? 'active' : ''}`}>
                  <span className="tab-icon"><FaUpload /></span>
                  <span className="tab-label">Upload</span>
                </Link>
                <Link to="/categories" className={`tab-item ${isActive('/categories') ? 'active' : ''}`}>
                  <span className="tab-icon"><FaTags /></span>
                  <span className="tab-label">Categories</span>
                </Link>
              </>
            )}

            {userInfo.role === 'mentor' && (
              <Link to="/mentor" className={`tab-item ${isActive('/mentor') ? 'active' : ''}`}>
                <span className="tab-icon"><FaChalkboardTeacher /></span>
                <span className="tab-label">Mentor</span>
              </Link>
            )}
          </>
        )}

        {!userInfo && (
          <Link to="/login" className={`tab-item ${isActive('/login') ? 'active' : ''}`}>
            <span className="tab-icon"><FaUserCircle /></span>
            <span className="tab-label">Login</span>
          </Link>
        )}
      </nav>
    </>
  );
};

export default Navbar;
