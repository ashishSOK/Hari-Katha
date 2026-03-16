import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import VideoCard from '../components/VideoCard/VideoCard';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import './VideoPlayerPage.css';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchVideoAndRelated = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data: videoData } = await axios.get(`${apiUrl}/api/videos/${id}`);
        setVideo(videoData);

        // Fetch related videos (same category)
        const { data: allVideos } = await axios.get(`${apiUrl}/api/videos?category=${videoData.category}`);
        setRelatedVideos(allVideos.filter(v => v._id !== videoData._id).slice(0, 5));

        // Add to watch history and check bookmarks if logged in
        if (token) {
          // Add to History
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          axios.post(`${apiUrl}/api/users/history/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error("History Error", err));

          // Check if already bookmarked
          const { data: bookmarks } = await axios.get(`${apiUrl}/api/users/bookmarks`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setIsBookmarked(bookmarks.some(b => b._id === videoData._id));
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      }
      setLoading(false);
    };

    fetchVideoAndRelated();
  }, [id, token]);

  // Handle the 10-second timer for anonymous users
  useEffect(() => {
    let timer;
    if (!loading && video && !token) {
      // User is not logged in, enforce 10-second limit
      timer = setTimeout(() => {
        setShowLoginPrompt(true);
      }, 10000); // 10 seconds
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, video, token]);

  const handleBookmark = async () => {
    if (!token) {
      alert("Please login to save videos.");
      return;
    }

    setBookmarkLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/users/bookmarks/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
    setBookmarkLoading(false);
  };

  const handleVideoDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmVideoDelete = async () => {
    setIsDeleteDialogOpen(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    setDeleteLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(error.response?.data?.message || 'Error deleting video.');
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading divine content...</div>;
  if (!video) return <div className="no-videos">Video not found.</div>;

  return (
    <div className="video-player-page">
      <Navbar />
      <div className="container player-container">
        <div className="main-player-section fade-in">
          <div className="iframe-wrapper">
            {showLoginPrompt ? (
              <div className="login-prompt-overlay">
                <img src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="Blurred thumbnail" className="blurred-bg" />
                <div className="login-prompt-content">
                  <h2>Sign in to continue watching</h2>
                  <p>Join the community to watch full lectures, save your favorites, and track your spiritual journey.</p>
                  <button className="login-btn-large" onClick={() => navigate('/login')}>Sign In / Register</button>
                </div>
              </div>
            ) : (
              <iframe
                title={video.title}
                src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
          <div className="video-details">
            <div className="title-row">
              <h1 className="video-player-title">{video.title}</h1>
              <button
                className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                onClick={handleBookmark}
                disabled={bookmarkLoading}
              >
                {isBookmarked ? 'Saved ★' : 'Save ☆'}
              </button>
            </div>

            <div className="category-and-actions">
              <p className="video-player-category">{video.category}</p>

              {/* Show delete button if user is Admin OR if Mentor uploaded it */}
              {userInfo && (userInfo.isAdmin || (userInfo.role === 'mentor' && video.uploadedBy === userInfo._id)) && (
                <button
                  className="delete-video-btn"
                  onClick={handleVideoDeleteClick}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Video'}
                </button>
              )}
            </div>

            <div className="video-description">
              {video.description || 'No description provided.'}
            </div>
            {/* Note taking section placeholder */}
            <div className="notes-section">
              <h3>Spiritual Notes</h3>
              <textarea placeholder="Jot down your realizations here..." className="notes-textarea"></textarea>
            </div>
          </div>
        </div>

        <div className="related-videos-section">
          <h3 className="section-title">Related Content</h3>
          <div className="related-grid">
            {relatedVideos.map(v => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmText="Delete Video"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmVideoDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default VideoPlayerPage;
