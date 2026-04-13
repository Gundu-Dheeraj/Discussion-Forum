const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Simple sentiment analysis
const analyzeSentiment = (text) => {
  const pos = ['good', 'great', 'excellent', 'agree', 'yes', 'correct', 'best', 'love', 'helpful'];
  const neg = ['bad', 'wrong', 'terrible', 'disagree', 'no', 'worst', 'hate', 'useless'];
  const lower = text.toLowerCase();
  const posCount = pos.filter((w) => lower.includes(w)).length;
  const negCount = neg.filter((w) => lower.includes(w)).length;
  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
};

// @GET /api/comments/:postId
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
      status: 'active',
    })
      .populate('author', 'username avatar role')
      .sort({ createdAt: -1 });

    // Attach replies
    const withReplies = await Promise.all(
      comments.map(async (c) => {
        const replies = await Comment.find({
          parentComment: c._id,
          status: 'active',
        }).populate('author', 'username avatar role');
        return { ...c.toObject(), replies };
      })
    );

    res.json(withReplies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/comments/:postId
exports.createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const sentiment = analyzeSentiment(content);
    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content,
      parentComment: parentComment || null,
      sentiment,
    });

    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

    // Notify post author
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'reply',
        message: `${req.user.username} commented on your post: "${post.title}"`,
        link: `/posts/${post._id}`,
      });

      // Emit socket notification
      if (req.io) {
        const connectedUsers = req.app.get('connectedUsers');
        const socketId = connectedUsers[post.author.toString()];
        if (socketId) {
          req.io.to(socketId).emit('notification', {
            type: 'reply',
            message: `${req.user.username} commented on your post`,
          });
        }
      }
    }

    const populated = await Comment.findById(comment._id).populate('author', 'username avatar role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    comment.status = 'removed';
    await comment.save();
    res.json({ message: 'Comment removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/comments/:id/best
exports.markBestAnswer = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const post = await Post.findById(comment.post);
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only post author can mark best answer' });
    }
    // Unmark previous best
    await Comment.updateMany({ post: comment.post }, { isBestAnswer: false });
    comment.isBestAnswer = true;
    await comment.save();

    await Notification.create({
      recipient: comment.author,
      sender: req.user._id,
      type: 'best_answer',
      message: `Your answer was marked as best on: "${post.title}"`,
      link: `/posts/${post._id}`,
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
