import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './PostCard.css';

const CATEGORY_COLORS = {
  Career: '#6c63ff', Tech: '#43e97b', Life: '#ff6584',
  Education: '#f7b731', Finance: '#00d2d3', Health: '#ff9f43', Other: '#8890a8',
};

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [votes, setVotes] = useState({
    up: post.upvotes?.length || 0,
    down: post.downvotes?.length || 0,
  });
  const [voting, setVoting] = useState(false);

  const handleVote = async (type, e) => {
    e.preventDefault();
    if (!user || voting) return;
    setVoting(true);
    try {
      const { data } = await API.post(`/votes/post/${post._id}`, { type });
      setVotes({ up: data.upvotes, down: data.downvotes });
    } catch {}
    setVoting(false);
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

  const catColor = CATEGORY_COLORS[post.category] || '#8890a8';
  const authorName = post.isAnonymous ? 'Anonymous' : post.author?.username;

  return (
    <Link to={`/posts/${post._id}`} className="post-card fade-in">
      <div className="post-card-side">
        <button
          className={`vote-btn up`}
          onClick={(e) => handleVote('up', e)}
          title="Upvote"
        >▲</button>
        <span className="vote-score">{votes.up - votes.down}</span>
        <button
          className={`vote-btn down`}
          onClick={(e) => handleVote('down', e)}
          title="Downvote"
        >▼</button>
      </div>

      <div className="post-card-body">
        <div className="post-card-meta">
          <span className="cat-tag" style={{ background: catColor + '22', color: catColor }}>
            {post.category}
          </span>
          {post.status === 'flagged' && <span className="badge" style={{ background: 'rgba(255,71,87,0.15)', color: 'var(--danger)' }}>⚑ Flagged</span>}
          {post.options?.length > 0 && <span className="tag">📊 Poll</span>}
        </div>

        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-desc">{post.description?.slice(0, 120)}{post.description?.length > 120 ? '...' : ''}</p>

        {post.tags?.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 4).map((t) => <span key={t} className="tag">#{t}</span>)}
          </div>
        )}

        <div className="post-card-footer">
          <div className="post-author">
            <div className="mini-avatar">{authorName?.slice(0, 1).toUpperCase()}</div>
            <span>{authorName}</span>
            {post.author?.role !== 'user' && (
              <span className={`badge badge-${post.author?.role}`}>{post.author?.role}</span>
            )}
          </div>
          <div className="post-stats">
            <span>💬 {post.commentsCount || 0}</span>
            <span>👁 {post.views || 0}</span>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
