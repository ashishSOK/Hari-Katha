const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  youtubeId: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ['Kirtan', 'Vaishnava Songs', 'Lectures', 'Bhagavad Gita', 'Other'],
    default: 'Other',
  },
  thumbnail: {
    type: String,
  },
  duration: {
    type: String,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Video', videoSchema);
