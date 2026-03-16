import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  return (
    <Link to={`/watch/${video._id}`} className="video-card fade-in">
      <div className="thumbnail-container">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="thumbnail"
          onError={(e) => {
            if (e.target.src.includes('maxresdefault.jpg')) {
              e.target.src = e.target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
            } else if (e.target.src.includes('hqdefault.jpg')) {
               e.target.src = e.target.src.replace('hqdefault.jpg', 'mqdefault.jpg');
            }
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
