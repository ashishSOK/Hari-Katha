import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import VideoCard from '../components/VideoCard/VideoCard';
import './UserHistory.css'; // Reusing the same layout logic

const UserBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view your saved videos.');
          setLoading(false);
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${apiUrl}/api/users/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookmarks(data);
      } catch (err) {
        setError('Failed to load saved videos.');
      }
      setLoading(false);
    };

    fetchBookmarks();
  }, []);

  return (
    <div className="user-page">
      <Navbar />
      <div className="container user-container fade-in">
        <div className="page-header">
          <h1 className="page-title">Saved Videos</h1>
          <p className="page-subtitle">Your personal collection of spiritual wisdom.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Loading collection...</div>
        ) : bookmarks.length === 0 && !error ? (
          <div className="empty-state">
            <p>You haven't saved any videos yet.</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Click the Bookmark icon on any video to save it here.</p>
          </div>
        ) : (
          <div className="video-grid">
            {bookmarks.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookmarks;
