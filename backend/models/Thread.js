const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['Clean', 'Flagged', 'Deleted'],
        default: 'Clean',
    },
    category: {
        type: String,
        enum: [
            'Movies', 'Sports', 'Music', 'News', 'Health',
            'Technology', 'Gaming', 'Science & Space', 'Finance', 'Others'
        ],
        default: 'Others',
    },
    repliesCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Thread', threadSchema);
