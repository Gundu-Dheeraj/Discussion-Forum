const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// Toxic word list (simple filter)
const toxicWords = ['spam', 'hate', 'abuse', 'idiot', 'stupid', 'kill'];
const containsToxic = (text) =>
  toxicWords.some((w) => text.toLowerCase().includes(w));

// @GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, sort = 'latest', search, tag } = req.query;
    const query = { status: 'active' };

    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    let sortObj = {};
    if (sort === 'latest') sortObj = { createdAt: -1 };
    else if (sort === 'top') sortObj = { upvotes: -1 };
    else if (sort === 'trending') sortObj = { views: -1, commentsCount: -1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };

    const posts = await Post.find(query)
      .populate('author', 'username avatar role')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/posts/:id
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username avatar role reputation');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { title, description, category, tags, options, isAnonymous } = req.body;

    // Auto-flag if toxic
    let status = 'active';
    if (containsToxic(title) || containsToxic(description)) status = 'flagged';

    const post = await Post.create({
      title,
      description,
      category,
      tags: tags || [],
      options: options ? options.map((o) => ({ text: o })) : [],
      isAnonymous: isAnonymous || false,
      author: req.user._id,
      status,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    const populated = await Post.findById(post._id).populate('author', 'username avatar role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description, category, tags } = req.body;
    Object.assign(post, { title, description, category, tags });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await post.deleteOne();
    await Comment.deleteMany({ post: post._id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/posts/stats/overview  
exports.getStats = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments({ status: 'active' });
    const categoryStats = await Post.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const trending = await Post.find({ status: 'active' })
      .sort({ views: -1 })
      .limit(5)
      .populate('author', 'username');

    res.json({ totalPosts, totalUsers, totalComments, categoryStats, trending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
