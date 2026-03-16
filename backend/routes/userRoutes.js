const express = require('express');
const router = express.Router();
const { getWatchHistory, addToWatchHistory, getBookmarks, toggleBookmark, assignMentor, getMentorMembers } = require('../controllers/userController');
const { protect } = require('../utils/authMiddleware');

router.route('/history')
  .get(protect, getWatchHistory);

router.route('/history/:videoId')
  .post(protect, addToWatchHistory);

router.route('/bookmarks')
  .get(protect, getBookmarks);

router.route('/bookmarks/:videoId')
  .post(protect, toggleBookmark);

router.route('/member/assign')
  .post(protect, assignMentor);

router.route('/mentor/members')
  .get(protect, getMentorMembers);

module.exports = router;
