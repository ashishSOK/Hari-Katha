import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import VideoCard from '../components/VideoCard/VideoCard';
import './UserHistory.css';

const UserHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view your watch history.');
          setLoading(false);
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${apiUrl}/api/users/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // The endpoint currently returns an array of ObjectIds (Video IDs) or populated videos.
        // Assuming the backend populates it. If not, we will handle that.
        setHistory(data);
      } catch (err) {
        setError('Failed to load history.');
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="user-page">
      <Navbar />
      <div className="container user-container fade-in">
        <div className="page-header">
          <h1 className="page-title">Watch History</h1>
          <p className="page-subtitle">Resume your spiritual journey where you left off.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Loading history...</div>
        ) : history.length === 0 && !error ? (
          <div className="empty-state">
            <p>You haven't watched any videos yet.</p>
          </div>
        ) : (
          <div className="video-grid">
            {history.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHistory;
