import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import './AuthPages.css';

const AuthPages = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '',
    role: 'member',
    isMentorKey: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-no-scroll');
    return () => document.body.classList.remove('auth-no-scroll');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const { data } = await axios.post(`${apiUrl}${endpoint}`, formData);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="container auth-container fade-in">
        <div className="auth-card">
          <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Join the Community'}</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Continue your spiritual journey.' 
              : 'Sign up to save history, bookmarks, and playlists.'}
          </p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            {!isLogin && (
              <div className="form-group role-group">
                <label>I am joining as a:</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="role-select"
                >
                  <option value="member">Spiritual Seeker (Member)</option>
                  <option value="mentor">Teacher (Mentor)</option>
                </select>
              </div>
            )}

            {!isLogin && formData.role === 'mentor' && (
              <div className="form-group">
                <label>Mentor Authorization Key</label>
                <input 
                  type="password" 
                  value={formData.isMentorKey}
                  onChange={(e) => setFormData({...formData, isMentorKey: e.target.value})}
                  placeholder="Secret key (e.g. mentor123)"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <button type="submit" className="auth-btn">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          
          <div className="auth-toggle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
