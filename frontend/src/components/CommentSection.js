import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './CommentSection.css';

const SENTIMENT_ICON = { positive: '😊', neutral: '😐', negative: '😞' };

function CommentItem({ comment, postAuthorId, onBestAnswer, onDelete, depth = 0 }) {
  const { user, isMod } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votes, setVotes] = useState({ up: comment.upvotes?.length || 0, down: comment.downvotes?.length || 0 });
  const [localReplies, setLocalReplies] = useState(comment.replies || []);
  const [reporting, setReporting] = useState(false);

  const handleVote = async (type) => {
    if (!user) return;
    try {
      const { data } = await API.post(`/votes/comment/${comment._id}`, { type });
      setVotes({ up: data.upvotes, down: data.downvotes });
    } catch {}
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/comments/${comment.post}`, {
        content: replyText,
        parentComment: comment._id,
      });
      setLocalReplies((prev) => [...prev, data]);
      setReplyText('');
      setShowReply(false);
    } catch {}
    setSubmitting(false);
  };

  const handleReport = async () => {
    try {
      await API.post('/reports', { targetType: 'Comment', targetId: comment._id, reason: 'Abuse' });
      alert('Comment reported');
    } catch {}
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className={`comment-item ${comment.isBestAnswer ? 'best-answer' : ''} depth-${Math.min(depth, 2)}`}>
      {comment.isBestAnswer && <div className="best-badge">✅ Best Answer</div>}
      <div className="comment-header">
        <div className="comment-author">
          <div className="mini-avatar">{comment.author?.username?.slice(0, 1).toUpperCase()}</div>
          <span className="comment-username">{comment.author?.username}</span>
          {comment.author?.role !== 'user' && (
            <span className={`badge badge-${comment.author?.role}`}>{comment.author?.role}</span>
          )}
          <span className="comment-time">{timeAgo(comment.createdAt)}</span>
          {comment.sentiment && (
            <span title={comment.sentiment} className="sentiment-icon">
              {SENTIMENT_ICON[comment.sentiment]}
            </span>
          )}
        </div>
        <div className="comment-actions">
          <button className="vote-btn up" onClick={() => handleVote('up')}>▲ {votes.up}</button>
          <button className="vote-btn down" onClick={() => handleVote('down')}>▼ {votes.down}</button>
          {user && user._id === postAuthorId && !comment.isBestAnswer && depth === 0 && (
            <button className="action-btn" onClick={() => onBestAnswer(comment._id)} title="Mark Best Answer">⭐</button>
          )}
          {user && (user._id === comment.author?._id || isMod) && (
            <button className="action-btn danger" onClick={() => onDelete(comment._id)} title="Delete">🗑</button>
          )}
          {user && user._id !== comment.author?._id && (
            <button className="action-btn" onClick={handleReport} title="Report">⚑</button>
          )}
        </div>
      </div>

      <p className="comment-content">{comment.content}</p>

      {user && depth < 2 && (
        <button className="reply-toggle" onClick={() => setShowReply(!showReply)}>
          ↩ Reply
        </button>
      )}

      {showReply && (
        <div className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
          />
          <div className="reply-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowReply(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={submitReply} disabled={submitting}>
              {submitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </div>
      )}

      {localReplies?.length > 0 && (
        <div className="replies-list">
          {localReplies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postAuthorId={postAuthorId}
              onBestAnswer={onBestAnswer}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, postAuthorId, initialComments = [] }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('latest');

  // Sync state if initialComments changes (e.g. after async fetch finishes)
  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top') return (b.upvotes?.length - b.downvotes?.length) - (a.upvotes?.length - a.downvotes?.length);
    if (sortBy === 'best') return b.isBestAnswer - a.isBestAnswer;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/comments/${postId}`, { content: newComment });
      setComments((prev) => [{ ...data, replies: [] }, ...prev]);
      setNewComment('');
    } catch {}
    setSubmitting(false);
  };

  const handleBestAnswer = async (commentId) => {
    try {
      await API.put(`/comments/${commentId}/best`);
      setComments((prev) =>
        prev.map((c) => ({ ...c, isBestAnswer: c._id === commentId }))
      );
    } catch {}
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {}
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h3>💬 Discussion <span className="comment-count">{comments.length}</span></h3>
        <div className="sort-tabs">
          {['latest', 'top', 'best'].map((s) => (
            <button
              key={s}
              className={`sort-tab ${sortBy === s ? 'active' : ''}`}
              onClick={() => setSortBy(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {user ? (
        <div className="comment-compose">
          <div className="mini-avatar">{user.username?.slice(0, 1).toUpperCase()}</div>
          <div className="compose-right">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your perspective..."
              rows={3}
            />
            <div className="compose-footer">
              <span className="char-count">{newComment.length}/1000</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={submitComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <a href="/login">Login</a> to join the discussion
        </div>
      )}

      <div className="comments-list">
        {sortedComments.length === 0 ? (
          <div className="empty-state"><p>No comments yet. Be the first!</p></div>
        ) : (
          sortedComments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              postAuthorId={postAuthorId}
              onBestAnswer={handleBestAnswer}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
