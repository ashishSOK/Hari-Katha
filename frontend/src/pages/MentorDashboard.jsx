import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import './MentorDashboard.css';

const MentorDashboard = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${apiUrl}/api/users/mentor/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMembers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching members');
      }
      setLoading(false);
    };

    fetchMembers();
  }, []);

  return (
    <div className="mentor-dashboard">
      <Navbar />
      <div className="container mentor-container fade-in">
        <h1 className="mentor-title">Mentor Dashboard</h1>
        <p className="mentor-subtitle">Track the spiritual progress of your members.</p>

        {error && <div className="mentor-error">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="no-members-box">
            <p>You currently have no members assigned to you.</p>
            <p className="hint">Members can assign themselves to you using your username.</p>
          </div>
        ) : (
          <div className="members-grid">
            {members.map(member => (
              <div key={member._id} className="member-card">
                <h3 className="member-name">@{member.username}</h3>
                <div className="member-stats">
                  <span className="stat-label">Videos watched:</span>
                  <span className="stat-value">{member.watchHistory.length}</span>
                </div>

                {member.watchHistory.length > 0 && (
                  <div className="recent-history">
                    <h4>Recent Watch History:</h4>
                    <ul className="history-list">
                      {member.watchHistory.slice(0, 3).map(video => (
                        <li key={video._id} className="history-item">
                          <span className="history-video-title">{video.title}</span>
                          <span className="history-video-category">{video.category}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
