const express = require('express');
const router = express.Router();
const { getVideos, getVideoById, createVideo, deleteVideo } = require('../controllers/videoController');
const { protect, adminOrMentor } = require('../utils/authMiddleware');

router.route('/')
  .get(getVideos)
  .post(protect, adminOrMentor, createVideo);

router.route('/:id')
  .get(getVideoById)
  .delete(protect, adminOrMentor, deleteVideo);

module.exports = router;
