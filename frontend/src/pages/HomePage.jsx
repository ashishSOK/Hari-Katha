import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import CategoryFilter from '../components/CategoryFilter/CategoryFilter';
import VideoCard from '../components/VideoCard/VideoCard';
import './HomePage.css';

const VERSE_DB = [
  { text: "Always think of Me, become My devotee, worship Me and offer your homage unto Me.", source: "- Bhagavad Gita 9.34" },
  { text: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.", source: "- Bhagavad Gita 2.47" },
  { text: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy.", source: "- Bhagavad Gita 6.6" },
  { text: "Whenever and wherever there is a decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion—at that time I descend Myself.", source: "- Bhagavad Gita 4.7" },
  { text: "A person is considered still further advanced when he regards honest well-wishers, affectionate benefactors, the neutral, mediators, the envious, friends and enemies, the pious and the sinners all with an equal mind.", source: "- Bhagavad Gita 6.9" },
  { text: "One who can control his senses by practicing the regulated principles of freedom can obtain the complete mercy of the Lord and thus become free from all attachment and aversion.", source: "- Bhagavad Gita 2.64" },
  { text: "A person in the divine consciousness, although engaged in seeing, hearing, touching, smelling, eating, moving about, sleeping and breathing, always knows within himself that he actually does nothing at all.", source: "- Bhagavad Gita 5.8-9" },
  { text: "He who has no attachments can really love others, for his love is pure and divine.", source: "- Bhagavad Gita 2.57" },
  { text: "As a strong wind sweeps away a boat on the water, even one of the roaming senses on which the mind focuses can carry away a man's intelligence.", source: "- Bhagavad Gita 2.67" },
  { text: "A person who is not disturbed by the incessant flow of desires—that enter like rivers into the ocean, which is ever being filled but is always still—can alone achieve peace, and not the man who strives to satisfy such desires.", source: "- Bhagavad Gita 2.70" }
];

const getDailyVerse = () => {
  const today = new Date();
  // Ensure the verse changes exactly once per day, safely indexing into VERSE_DB
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return VERSE_DB[dayOfYear % VERSE_DB.length];
};

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(['All']);
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${apiUrl}/api/videos/categories`);
        setCategories(['All', ...data]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

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
            <h1 className="banner-title">"{getDailyVerse().text}"</h1>
            <p className="banner-source">{getDailyVerse().source}</p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="content-section container">
        <div className="home-category-header">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

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
