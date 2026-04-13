import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import './CreatePost.css';

const CATEGORIES = ['Career', 'Tech', 'Life', 'Education', 'Finance', 'Health', 'Other'];

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Tech', tags: '', isAnonymous: false,
  });
  const [options, setOptions] = useState(['', '']);
  const [enablePoll, setEnablePoll] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (i, val) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  const addOption = () => { if (options.length < 6) setOptions([...options, '']); };
  const removeOption = (i) => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.description.trim()) return setError('Title and description are required');

    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const pollOptions = enablePoll ? options.filter((o) => o.trim()) : [];
    if (enablePoll && pollOptions.length < 2) return setError('Add at least 2 poll options');

    setLoading(true);
    try {
      const { data } = await API.post('/posts', {
        ...form, tags, options: pollOptions,
      });
      navigate(`/posts/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
    setLoading(false);
  };

  return (
    <div className="create-page">
      <div className="create-card card fade-in">
        <h2 className="create-title">⚖ Post a Decision</h2>
        <p className="create-sub">Share your dilemma and get community insights</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title <span className="req">*</span></label>
            <input
              placeholder="e.g. Should I choose React or Vue for my next project?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
              required
            />
            <span className="field-hint">{form.title.length}/200</span>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Tags <span className="hint-text">(comma-separated)</span></label>
              <input
                placeholder="e.g. career, programming, advice"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description <span className="req">*</span></label>
            <textarea
              rows={5}
              placeholder="Explain your situation in detail. What are the pros and cons? What have you considered so far?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={2000}
              required
            />
            <span className="field-hint">{form.description.length}/2000</span>
          </div>

          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              />
              <span>Post anonymously</span>
            </label>
          </div>

          {/* Poll toggle */}
          <div className="poll-section">
            <div className="poll-toggle-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={enablePoll}
                  onChange={(e) => setEnablePoll(e.target.checked)}
                />
                <span>Add a Poll</span>
              </label>
              <span className="hint-text">Let users vote on options</span>
            </div>

            {enablePoll && (
              <div className="poll-options fade-in">
                {options.map((opt, i) => (
                  <div key={i} className="poll-option-row">
                    <input
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                    />
                    {options.length > 2 && (
                      <button type="button" className="remove-opt" onClick={() => removeOption(i)}>✕</button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addOption}>
                    + Add Option
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="create-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : '⚖ Post Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
