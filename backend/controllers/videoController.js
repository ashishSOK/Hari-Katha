const Video = require('../models/Video');
const { extractYouTubeId } = require('../utils/youtubeParser');

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    const category = req.query.category;
    const filter = category && category !== 'All' ? { category } : {};
    
    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new video
// @route   POST /api/videos
// @access  Private/Admin or Mentor
const createVideo = async (req, res) => {
  try {
    const { title, url, description, category, thumbnail, duration } = req.body;
    
    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const videoExists = await Video.findOne({ youtubeId });
    if (videoExists) {
      return res.status(400).json({ message: 'Video already exists in the database' });
    }

    const video = new Video({
      title,
      youtubeId,
      description,
      category,
      thumbnail: thumbnail || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      duration,
      uploadedBy: req.user._id, // Track who uploaded the video
    });

    const createdVideo = await video.save();
    res.status(201).json(createdVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private/Admin or Mentor
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Admins can delete anything; mentors can only delete their own uploads
    if (!req.user.isAdmin) {
      if (req.user.role !== 'mentor' || video.uploadedBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this video' });
      }
    }

    await video.deleteOne();
    res.json({ message: 'Video removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  createVideo,
  deleteVideo,
};
