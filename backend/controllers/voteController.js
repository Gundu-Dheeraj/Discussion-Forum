const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @POST /api/votes/post/:id
exports.votePost = async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (type === 'up') {
      if (hasUpvoted) {
        post.upvotes.pull(userId);
      } else {
        post.upvotes.addToSet(userId);
        post.downvotes.pull(userId);
      }
    } else {
      if (hasDownvoted) {
        post.downvotes.pull(userId);
      } else {
        post.downvotes.addToSet(userId);
        post.upvotes.pull(userId);
      }
    }

    await post.save();
    res.json({ upvotes: post.upvotes.length, downvotes: post.downvotes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/votes/comment/:id
exports.voteComment = async (req, res) => {
  try {
    const { type } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user._id;
    const hasUpvoted = comment.upvotes.includes(userId);
    const hasDownvoted = comment.downvotes.includes(userId);

    if (type === 'up') {
      if (hasUpvoted) {
        comment.upvotes.pull(userId);
      } else {
        comment.upvotes.addToSet(userId);
        comment.downvotes.pull(userId);
      }
    } else {
      if (hasDownvoted) {
        comment.downvotes.pull(userId);
      } else {
        comment.downvotes.addToSet(userId);
        comment.upvotes.pull(userId);
      }
    }

    await comment.save();
    res.json({ upvotes: comment.upvotes.length, downvotes: comment.downvotes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/votes/poll/:postId/:optionId
exports.votePoll = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;

    // Remove user from all options first
    post.options.forEach((opt) => opt.votes.pull(userId));

    // Add to selected option
    const option = post.options.id(req.params.optionId);
    if (!option) return res.status(404).json({ message: 'Option not found' });
    option.votes.addToSet(userId);

    await post.save();
    res.json(post.options);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
