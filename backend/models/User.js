const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['member', 'mentor', 'admin'],
    default: 'member',
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  watchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
