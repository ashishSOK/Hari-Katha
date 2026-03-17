/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats.
 * @param {string} url - The YouTube URL
 * @returns {string|null} The video ID, or null if not found
 */
const extractYouTubeId = (url) => {
  if (!url) return null;
  // Enhanced Regex to support youtube.com/live/ID, youtube.com/shorts/ID, and standard watch/embed URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};

module.exports = {
  extractYouTubeId,
};
