import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import VideoCard from '../components/VideoCard/VideoCard';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import YoutubeCustomControls from '../components/YoutubeCustomControls/YoutubeCustomControls';
import './VideoPlayerPage.css';

// ── YouTube postMessage helpers ───────────────────────────────────────────────
const ytCmd = (iframe, func, args = []) => {
  if (!iframe) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: 'command', func, args }),
    '*'
  );
};

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const pollRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMessage, setNoteMessage] = useState('');

  // ── Custom player state ──────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const token = localStorage.getItem('token');

  // ── Listen for YouTube player state messages ─────────────────────────────
  useEffect(() => {
    const onMessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime !== undefined) setCurrentTime(data.info.currentTime);
          if (data.info.duration !== undefined) setDuration(data.info.duration);
          if (data.info.volume !== undefined) setVolume(data.info.volume / 100);
          if (data.info.muted !== undefined) setIsMuted(data.info.muted);
          if (data.info.playerState !== undefined) {
            // 1 = playing, anything else = paused/ended/buffering
            setIsPlaying(data.info.playerState === 1);
          }
        }
      } catch (_) { /* not a JSON message */ }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // ── Fullscreen change listener ───────────────────────────────────────────
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Poll YouTube for current time every 500ms ────────────────────────────
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      ytCmd(iframeRef.current, 'getPlayerInfoRequest');
    }, 500);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const handleIframeLoad = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening' }), '*'
    );
    startPolling();
  }, [startPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Custom control handlers ──────────────────────────────────────────────
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      ytCmd(iframeRef.current, 'pauseVideo');
      setIsPlaying(false);
    } else {
      ytCmd(iframeRef.current, 'playVideo');
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time) => {
    ytCmd(iframeRef.current, 'seekTo', [time, true]);
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((val) => {
    ytCmd(iframeRef.current, 'setVolume', [Math.round(val * 100)]);
    setVolume(val);
    if (val > 0 && isMuted) {
      ytCmd(iframeRef.current, 'unMute');
      setIsMuted(false);
    }
  }, [isMuted]);

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      ytCmd(iframeRef.current, 'unMute');
      setIsMuted(false);
    } else {
      ytCmd(iframeRef.current, 'mute');
      setIsMuted(true);
    }
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    const wrapper = iframeRef.current?.closest('.iframe-wrapper');
    if (!document.fullscreenElement) {
      wrapper?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // ── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVideoAndRelated = async () => {
      window.scrollTo(0, 0);
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data: videoData } = await axios.get(`${apiUrl}/api/videos/${id}`);
        setVideo(videoData);

        const { data: allVideos } = await axios.get(`${apiUrl}/api/videos?category=${videoData.category}`);
        setRelatedVideos(allVideos.filter(v => v._id !== videoData._id).slice(0, 5));

        if (token) {
          axios.post(`${apiUrl}/api/users/history/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => console.error('History Error', err));

          const { data: bookmarks } = await axios.get(`${apiUrl}/api/users/bookmarks`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsBookmarked(bookmarks.some(b => b._id === videoData._id));

          // Fetch user's note for this video
          try {
            const { data: noteData } = await axios.get(`${apiUrl}/api/users/notes/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (noteData && noteData.text) {
              setNoteText(noteData.text);
            }
          } catch (err) {
            console.error('Error fetching notes:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      }
      setLoading(false);
    };

    fetchVideoAndRelated();
  }, [id, token]);

  // 10-second timer for anonymous users
  useEffect(() => {
    let timer;
    if (!loading && video && !token) {
      timer = setTimeout(() => setShowLoginPrompt(true), 10000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [loading, video, token]);

  const handleBookmark = async () => {
    if (!token) { alert('Please login to save videos.'); return; }
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

  const handleSaveNote = async () => {
    if (!token) {
      alert('Please login to save notes.');
      return;
    }
    setNoteSaving(true);
    setNoteMessage('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/users/notes/${id}`, { text: noteText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNoteMessage('Note saved successfully!');
      setTimeout(() => setNoteMessage(''), 3000);
    } catch (error) {
      console.error('Error saving note:', error);
      setNoteMessage('Failed to save note.');
    }
    setNoteSaving(false);
  };

  const handleVideoDeleteClick = () => setIsDeleteDialogOpen(true);

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
                <img
                  src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt="Blurred thumbnail"
                  className="blurred-bg"
                />
                <div className="login-prompt-content">
                  <h2>Sign in to continue watching</h2>
                  <p>Join the community to watch full lectures, save your favorites, and track your spiritual journey.</p>
                  <button className="login-btn-large" onClick={() => navigate('/login')}>Sign In / Register</button>
                </div>
              </div>
            ) : (
              <>
                <iframe
                  ref={iframeRef}
                  title={video.title}
                  src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&autoplay=1&controls=0&enablejsapi=1&iv_load_policy=3&disablekb=1&origin=${encodeURIComponent(window.location.origin)}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                ></iframe>
                <YoutubeCustomControls
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  isMuted={isMuted}
                  isFullscreen={isFullscreen}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                  onVolumeChange={handleVolumeChange}
                  onMuteToggle={handleMuteToggle}
                  onFullscreen={handleFullscreen}
                />
              </>
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
            <div className="notes-section">
              <div className="notes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Spiritual Notes</h3>
                {noteMessage && <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem' }}>{noteMessage}</span>}
              </div>
              <textarea 
                placeholder={token ? "Jot down your realizations here..." : "Login to save your spiritual notes..."}
                className="notes-textarea"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                disabled={!token}
              ></textarea>
              {token && (
                <button 
                  onClick={handleSaveNote} 
                  disabled={noteSaving}
                  style={{ 
                    marginTop: '12px', padding: '8px 16px', background: 'var(--primary-gradient)', 
                    color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', float: 'right' 
                  }}
                >
                  {noteSaving ? 'Saving...' : 'Save Note'}
                </button>
              )}
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
