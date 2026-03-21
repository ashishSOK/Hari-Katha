const Video = require('../models/Video');
const Category = require('../models/Category');
const { extractYouTubeId } = require('../utils/youtubeParser');

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    const { category, mentorId } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (mentorId) filter.uploadedBy = mentorId;

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

// @desc    Get all unique video categories
// @route   GET /api/videos/categories
// @access  Public
const getUniqueCategories = async (req, res) => {
  try {
    // 1. Get dynamically used categories from videos
    const videoCategories = await Video.distinct('category');
    // 2. Get saved standalone categories
    const savedCategoriesObj = await Category.find({}, 'name');
    const savedCategories = savedCategoriesObj.map(c => c.name);

    // Merge and remove duplicates, ensuring system categories are always present
    const SYSTEM_CATEGORIES = ['Kirtan', 'Vaishnava Songs', 'Lectures', 'Bhagavad Gita', 'Other'];
    const allCategories = [...new Set([...SYSTEM_CATEGORIES, ...videoCategories, ...savedCategories])].filter(Boolean).sort();
    
    // Ensure "Other" isn't strictly the only default, just return the merged list
    res.json(allCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new standalone category
// @route   POST /api/videos/categories
// @access  Private/Admin or Mentor
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a custom category
// @route   DELETE /api/videos/categories/:name
// @access  Private/Admin or Mentor
const deleteCategory = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const SYSTEM_CATEGORIES = ['Kirtan', 'Vaishnava Songs', 'Lectures', 'Bhagavad Gita', 'Other'];
    if (SYSTEM_CATEGORIES.includes(name)) {
      return res.status(400).json({ message: 'Cannot delete system categories' });
    }

    const deleted = await Category.findOneAndDelete({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  createVideo,
  deleteVideo,
  getUniqueCategories,
  createCategory,
  deleteCategory,
};
