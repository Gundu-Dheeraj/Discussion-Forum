const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const flaggedPosts = await Post.countDocuments({ status: 'flagged' });

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('username email role createdAt');
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'username');

    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const postsByCategory = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers, totalPosts, totalComments,
      pendingReports, bannedUsers, flaggedPosts,
      recentUsers, recentPosts, userRoles, postsByCategory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { username: { $regex: search, $options: 'i' } } : {};
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id/ban
exports.banUser = async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned, banReason: banReason || '' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isBanned) {
      await Notification.create({
        recipient: user._id,
        type: 'ban',
        message: `Your account has been suspended. Reason: ${banReason}`,
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id/role
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/posts/:id/status
exports.updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (status === 'removed') {
      await Notification.create({
        recipient: post.author,
        type: 'moderation',
        message: `Your post "${post.title}" has been removed by a moderator.`,
      });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/flagged
exports.getFlaggedContent = async (req, res) => {
  try {
    const flaggedPosts = await Post.find({ status: 'flagged' })
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    const flaggedComments = await Comment.find({ status: 'flagged' })
      .populate('author', 'username')
      .populate('post', 'title');
    res.json({ flaggedPosts, flaggedComments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
