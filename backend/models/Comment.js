const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isBestAnswer: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'flagged', 'removed'],
      default: 'active',
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', ''],
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
