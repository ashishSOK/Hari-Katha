const User = require('../models/User');
const Video = require('../models/Video');

// @desc    Get all mentors (public, for signup dropdown)
// @route   GET /api/users/mentors
// @access  Public
const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('_id username');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user watch history
// @route   GET /api/users/history
// @access  Private
const getWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('watchHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.watchHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add video to watch history
// @route   POST /api/users/history/:videoId
// @access  Private
const addToWatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const videoId = req.params.videoId;

    if (!user.watchHistory.includes(videoId)) {
      user.watchHistory.unshift(videoId); // Add to beginning
      await user.save();
    }

    res.json({ message: 'Added to watch history', history: user.watchHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookmarks
// @route   GET /api/users/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle video bookmark
// @route   POST /api/users/bookmarks/:videoId
// @access  Private
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const videoId = req.params.videoId;

    const index = user.bookmarks.indexOf(videoId);
    if (index === -1) {
      user.bookmarks.push(videoId);
    } else {
      user.bookmarks.splice(index, 1);
    }

    await user.save();
    res.json({ message: index === -1 ? 'Bookmarked' : 'Bookmark removed', bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign a mentor to the current user
// @route   POST /api/users/member/assign
// @access  Private
const assignMentor = async (req, res) => {
  try {
    const { mentorUsername } = req.body;

    // Find the requested mentor
    const mentor = await User.findOne({ username: mentorUsername, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found or user is not a mentor' });
    }

    const user = await User.findById(req.user._id);
    user.mentorId = mentor._id;
    await user.save();

    res.json({ message: 'Mentor assigned successfully', mentorId: mentor._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all members assigned to a mentor along with their watch history
// @route   GET /api/users/mentor/members
// @access  Private (Mentors only)
const getMentorMembers = async (req, res) => {
  try {
    if (req.user.role !== 'mentor' && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as a mentor' });
    }

    const members = await User.find({ mentorId: req.user._id })
      .select('-password')
      .populate('watchHistory');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get note for a specific video
// @route   GET /api/users/notes/:videoId
// @access  Private
const getNote = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const videoId = req.params.videoId;
    const notesArray = user.notes || [];
    const note = notesArray.find((n) => n.videoId.toString() === videoId);

    if (note) {
      res.json({ text: note.text });
    } else {
      res.json({ text: '' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save or update note for a specific video
// @route   POST /api/users/notes/:videoId
// @access  Private
const saveNote = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const videoId = req.params.videoId;
    const { text } = req.body;

    user.notes = user.notes || [];
    const existingNoteIndex = user.notes.findIndex((n) => n.videoId.toString() === videoId);

    if (existingNoteIndex !== -1) {
      // Update existing
      user.notes[existingNoteIndex].text = text;
      user.notes[existingNoteIndex].updatedAt = Date.now();
    } else {
      // Add new
      user.notes.push({ videoId, text });
    }

    await user.save();
    res.json({ message: 'Note saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMentors,
  getWatchHistory,
  addToWatchHistory,
  getBookmarks,
  toggleBookmark,
  assignMentor,
  getMentorMembers,
  saveNote,
  getNote,
};
