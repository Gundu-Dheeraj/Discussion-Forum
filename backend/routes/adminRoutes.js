const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, banUser, changeRole,
  updatePostStatus, getFlaggedContent
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/stats', authorize('admin', 'moderator'), getDashboardStats);
router.get('/users', authorize('admin', 'moderator'), getUsers);
router.put('/users/:id/ban', authorize('admin', 'moderator'), banUser);
router.put('/users/:id/role', authorize('admin'), changeRole);
router.put('/posts/:id/status', authorize('admin', 'moderator'), updatePostStatus);
router.get('/flagged', authorize('admin', 'moderator'), getFlaggedContent);

module.exports = router;
