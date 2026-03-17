const express = require('express');
const router = express.Router();
const { getWatchHistory, addToWatchHistory, getBookmarks, toggleBookmark, assignMentor, getMentorMembers, saveNote, getNote } = require('../controllers/userController');
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

router.route('/notes/:videoId')
  .get(protect, getNote)
  .post(protect, saveNote);

module.exports = router;
