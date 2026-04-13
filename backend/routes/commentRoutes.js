const express = require('express');
const router = express.Router();
const { getComments, createComment, deleteComment, markBestAnswer } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:postId', getComments);
router.post('/:postId', protect, createComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/best', protect, markBestAnswer);

module.exports = router;
