import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import './PostDetails.css';

const CATEGORY_COLORS = {
  Career: '#6c63ff', Tech: '#43e97b', Life: '#ff6584',
  Education: '#f7b731', Finance: '#00d2d3', Health: '#ff9f43', Other: '#8890a8',
};

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isMod } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({ up: 0, down: 0 });
  const [pollVoted, setPollVoted] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  const loadPost = async () => {
    try {
      const { data } = await API.get(`/posts/${id}`);
      setPost(data);
      setVotes({ up: data.upvotes?.length || 0, down: data.downvotes?.length || 0 });
    } catch {
      navigate('/');
    }
    setLoading(false);
  };

  const loadComments = async () => {
    try {
      const { data } = await API.get(`/comments/${id}`);
      setComments(data);
    } catch {}
  };

  const handleVote = async (type) => {
    if (!user) return;
    try {
      const { data } = await API.post(`/votes/post/${id}`, { type });
      setVotes({ up: data.upvotes, down: data.downvotes });
    } catch {}
  };

  const handlePollVote = async (optionId) => {
    if (!user || pollVoted) return;
    try {
      const { data } = await API.post(`/votes/poll/${id}/${optionId}`);
      setPost((prev) => ({ ...prev, options: data }));
      setPollVoted(true);
    } catch {}
  };

  const handleReport = async () => {
    try {
      await API.post('/reports', { targetType: 'Post', targetId: id, reason: reportReason });
      alert('Post reported. Thank you!');
      setReporting(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to report');
    }
  };

  const handleModAction = async (status) => {
    try {
      await API.put(`/admin/posts/${id}/status`, { status });
      setPost((prev) => ({ ...prev, status }));
    } catch {}
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate('/');
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

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!post) return null;

  const totalPollVotes = post.options?.reduce((sum, o) => sum + (o.votes?.length || 0), 0) || 0;
  const catColor = CATEGORY_COLORS[post.category] || '#8890a8';
  const isAuthor = user?._id === post.author?._id;
  const authorName = post.isAnonymous ? 'Anonymous' : post.author?.username;

  return (
    <div className="post-details-page">
      <div className="post-details-main">
        {/* Post Header */}
        <div className="card post-header fade-in">
          <div className="post-meta-row">
            <span className="cat-tag" style={{ background: catColor + '22', color: catColor }}>
              {post.category}
            </span>
            {post.status === 'flagged' && (
              <span className="badge" style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--danger)' }}>⚑ Flagged</span>
            )}
            {post.status === 'removed' && (
              <span className="badge" style={{ background: 'rgba(255,71,87,0.2)', color: 'var(--danger)' }}>🚫 Removed</span>
            )}
            <span className="post-detail-time">{timeAgo(post.createdAt)}</span>
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-author-row">
            <div className="mini-avatar lg">
              {authorName?.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <span className="post-author-name">{authorName}</span>
              {!post.isAnonymous && post.author?.role !== 'user' && (
                <span className={`badge badge-${post.author?.role}`}>{post.author?.role}</span>
              )}
            </div>
          </div>

          <p className="post-detail-desc">{post.description}</p>

          {post.tags?.length > 0 && (
            <div className="post-detail-tags">
              {post.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
            </div>
          )}

          {/* Poll */}
          {post.options?.length > 0 && (
            <div className="poll-section-detail">
              <h3 className="poll-title">📊 Vote on this decision</h3>
              <div className="poll-options-list">
                {post.options.map((opt) => {
                  const pct = totalPollVotes > 0 ? Math.round((opt.votes?.length / totalPollVotes) * 100) : 0;
                  return (
                    <button
                      key={opt._id}
                      className={`poll-option-btn ${pollVoted ? 'voted' : ''}`}
                      onClick={() => handlePollVote(opt._id)}
                      disabled={!user || pollVoted}
                    >
                      <div className="poll-opt-bar" style={{ width: `${pct}%` }} />
                      <span className="poll-opt-text">{opt.text}</span>
                      {pollVoted && <span className="poll-opt-pct">{pct}%</span>}
                    </button>
                  );
                })}
              </div>
              <p className="poll-total">{totalPollVotes} votes total</p>
            </div>
          )}

          {/* Vote + Actions */}
          <div className="post-actions-row">
            <div className="vote-group">
              <button className="vote-action-btn up" onClick={() => handleVote('up')}>
                ▲ {votes.up}
              </button>
              <button className="vote-action-btn down" onClick={() => handleVote('down')}>
                ▼ {votes.down}
              </button>
              <span className="vote-diff">{votes.up - votes.down} pts</span>
            </div>

            <div className="post-action-btns">
              {user && user._id !== post.author?._id && (
                <button className="btn btn-ghost btn-sm" onClick={() => setReporting(!reporting)}>
                  ⚑ Report
                </button>
              )}
              {(isAuthor || isMod) && (
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Delete</button>
              )}
              {isMod && post.status === 'flagged' && (
                <button className="btn btn-success btn-sm" onClick={() => handleModAction('active')}>
                  ✓ Approve
                </button>
              )}
              {isMod && post.status === 'active' && (
                <button className="btn btn-ghost btn-sm" onClick={() => handleModAction('removed')}>
                  🚫 Remove
                </button>
              )}
            </div>
          </div>

          {/* Report form */}
          {reporting && (
            <div className="report-form fade-in">
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                {['Spam', 'Abuse', 'Irrelevant', 'Misinformation', 'Other'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setReporting(false)}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={handleReport}>Submit Report</button>
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <CommentSection
          postId={id}
          postAuthorId={post.author?._id}
          initialComments={comments}
        />
      </div>

      {/* Sidebar */}
      <aside className="post-sidebar">
        <div className="card">
          <h3 className="sidebar-title">📈 Post Stats</h3>
          <div className="post-stat-item"><span>Views</span><strong>{post.views}</strong></div>
          <div className="post-stat-item"><span>Upvotes</span><strong style={{ color: 'var(--success)' }}>{votes.up}</strong></div>
          <div className="post-stat-item"><span>Downvotes</span><strong style={{ color: 'var(--danger)' }}>{votes.down}</strong></div>
          <div className="post-stat-item"><span>Comments</span><strong>{post.commentsCount}</strong></div>
          <div className="post-stat-item"><span>Status</span>
            <span className="status-badge" data-status={post.status}>{post.status}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
