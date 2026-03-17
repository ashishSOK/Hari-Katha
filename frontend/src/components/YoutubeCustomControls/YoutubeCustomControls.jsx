import React from 'react';
import './YoutubeCustomControls.css';

// Format seconds to mm:ss or h:mm:ss
const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '0:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const YoutubeCustomControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreen,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="ycc-bar">
      {/* Seek / Progress bar */}
      <div className="ycc-seekbar-row">
        <div className="ycc-seekbar-track">
          <div className="ycc-seekbar-fill" style={{ width: `${progress}%` }} />
          <input
            className="ycc-seekbar-input"
            type="range"
            min="0"
            max={duration || 0}
            step="0.5"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Bottom row: left controls | right controls */}
      <div className="ycc-bottom-row">
        {/* Left side */}
        <div className="ycc-left">
          {/* Play / Pause */}
          <button className="ycc-btn ycc-playpause" onClick={onPlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
            )}
          </button>

          {/* Volume */}
          <div className="ycc-volume-group">
            <button className="ycc-btn" onClick={onMuteToggle} aria-label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted || volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
              ) : volume < 0.5 ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
              )}
            </button>
            <input
              className="ycc-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Volume"
            />
          </div>

          {/* Time display */}
          <span className="ycc-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Right side */}
        <div className="ycc-right">
          {/* Fullscreen */}
          <button className="ycc-btn" onClick={onFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default YoutubeCustomControls;
