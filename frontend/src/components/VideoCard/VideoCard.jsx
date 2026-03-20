import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  return (
    <Link to={`/watch/${video._id}`} className="video-card fade-in">
      <div className="thumbnail-container">
        <img
          src={video.thumbnail || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : '/default-thumbnail.jpg')}
          alt={video.title}
          className="thumbnail"
          onLoad={(e) => {
            // YouTube returns a 120×90 white image when no thumbnail exists
            if (e.target.naturalWidth === 120 || e.target.naturalWidth <= 120) {
              e.target.src = '/default-thumbnail.jpg';
            }
          }}
          onError={(e) => {
            e.target.src = '/default-thumbnail.jpg';
          }}
        />
        <div className="duration-badge">{video.duration || '0:00'}</div>
        <div className="play-overlay">
          <FaPlay className="play-icon" />
        </div>
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-category">{video.category}</p>
      </div>
    </Link>
  );
};

export default VideoCard;
