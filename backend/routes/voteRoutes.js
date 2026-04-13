const express = require('express');
const router = express.Router();
const { votePost, voteComment, votePoll } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/post/:id', protect, votePost);
router.post('/comment/:id', protect, voteComment);
router.post('/poll/:postId/:optionId', protect, votePoll);

module.exports = router;
