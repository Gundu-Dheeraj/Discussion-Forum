const express = require('express');
const router = express.Router();
const {
    getThreads,
    getThreadById,
    createThread,
    addComment,
    deleteThread,
    deleteComment,
    updateThread,
    updateComment
} = require('../controllers/threadController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getThreads)
    .post(protect, createThread);

router.route('/:id')
    .get(getThreadById)
    .put(protect, updateThread)
    .delete(protect, deleteThread);

router.post('/:id/comments', protect, addComment);
router.put('/:id/comments/:commentId', protect, updateComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
