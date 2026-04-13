const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAnonymous: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['Career', 'Tech', 'Life', 'Education', 'Finance', 'Health', 'Other'],
      default: 'Other',
    },
    tags: [{ type: String, trim: true }],
    options: [optionSchema],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'flagged', 'removed', 'resolved'],
      default: 'active',
    },
    isFeatured: { type: Boolean, default: false },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
postSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
