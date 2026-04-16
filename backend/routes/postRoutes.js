const express = require('express');
const router = express.Router();
const {
  getPosts, getPost, createPost, updatePost, deletePost, getStats, syncStats
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/sync-stats', syncStats);
router.get('/stats/overview', getStats);
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
