import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import CategoryFilter from '../components/CategoryFilter/CategoryFilter';
import VideoCard from '../components/VideoCard/VideoCard';
import './HomePage.css';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [assigningStr, setAssigningStr] = useState('');
  const [assignMessage, setAssignMessage] = useState('');

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const url = activeCategory === 'All' 
          ? `${apiUrl}/api/videos`
          : `${apiUrl}/api/videos?category=${activeCategory}`;
        const { data } = await axios.get(url);
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [activeCategory]);

  const handleAssignMentor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/users/member/assign`, { mentorUsername: assigningStr }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignMessage('Mentor linked successfully!');
      
      // Update local storage to reflect they now have a mentor
      const updatedUser = { ...userInfo, mentorId: 'assigned' };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      setAssigningStr('');
    } catch (err) {
      setAssignMessage(err.response?.data?.message || 'Failed to assign mentor');
    }
  };

  return (
    <div className="homepage">
      <Navbar />
      
      {/* Mentor Assignment UI */}
      {userInfo && userInfo.role === 'member' && !userInfo.mentorId && (
        <div className="container mentor-assign-banner fade-in">
          <p>Want to track your progress with a teacher? Assign a Mentor below!</p>
          <form onSubmit={handleAssignMentor} className="assign-form">
            <input 
              type="text" 
              placeholder="Mentor's Username"
              value={assigningStr}
              onChange={e => setAssigningStr(e.target.value)}
              required 
            />
            <button type="submit">Connect Mentor</button>
          </form>
          {assignMessage && <div className="assign-msg">{assignMessage}</div>}
        </div>
      )}

      {/* Daily Verse Banner */}
      <section className="banner-section">
        <div className="container banner-container fade-in">
          <div className="banner-content">
            <h2 className="banner-subtitle">Daily Verse</h2>
            <h1 className="banner-title">"Always think of Me, become My devotee, worship Me and offer your homage unto Me."</h1>
            <p className="banner-source">- Bhagavad Gita 9.34</p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="content-section container">
        <CategoryFilter 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
        
        {loading ? (
          <div className="loading-spinner">Loading divine content...</div>
        ) : (
          <div className="video-grid">
            {videos.length === 0 ? (
              <p className="no-videos">No videos found for this category.</p>
            ) : (
              videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
