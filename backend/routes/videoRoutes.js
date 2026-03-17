const express = require('express');
const router = express.Router();
const { getVideos, getVideoById, createVideo, deleteVideo, getUniqueCategories, createCategory, deleteCategory } = require('../controllers/videoController');
const { protect, adminOrMentor } = require('../utils/authMiddleware');

router.route('/categories')
  .get(getUniqueCategories)
  .post(protect, adminOrMentor, createCategory);

router.route('/categories/:name')
  .delete(protect, adminOrMentor, deleteCategory);

router.route('/')
  .get(getVideos)
  .post(protect, adminOrMentor, createVideo);

router.route('/:id')
  .get(getVideoById)
  .delete(protect, adminOrMentor, deleteVideo);

module.exports = router;
