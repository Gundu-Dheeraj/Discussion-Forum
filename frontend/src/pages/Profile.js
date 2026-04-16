import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    API.get('/posts?limit=20').then(({ data }) => {
      setMyPosts((data.posts || []).filter((p) => p.author?._id === user?._id));
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', form);
      updateUser(data);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingAvatar(true);
    try {
      // Must not use default config if Content-Type needs to be different, but axios handles FormData automatically.
      const { data } = await API.post('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data);
      setForm((prev) => ({ ...prev, avatar: data.avatar }));
      setMsg('Profile picture updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to upload image');
    }
    setUploadingAvatar(false);
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    
    setUploadingAvatar(true);
    try {
      const { data } = await API.delete('/auth/profile-picture');
      updateUser(data);
      setForm((prev) => ({ ...prev, avatar: '' }));
      setMsg('Profile picture removed!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to remove image');
    }
    setUploadingAvatar(false);
  };

  const initials = user?.username?.slice(0, 2).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-hero card fade-in">
        <div className="profile-avatar-container">
          {user?.avatar ? (
            <img src={`${(process.env.REACT_APP_API_URL || '').replace('/api', '')}${user.avatar}`} alt="Avatar" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">{initials}</div>
          )}
          <label className="avatar-upload-label" aria-disabled={uploadingAvatar} title="Change avatar">
            {uploadingAvatar ? '⏳' : '📷'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} hidden />
          </label>
          {user?.avatar && (
            <button className="avatar-delete-btn" onClick={handleAvatarDelete} disabled={uploadingAvatar} title="Remove avatar">
              ✖
            </button>
          )}
        </div>
        <div className="profile-info">
          <h2>{user?.username}</h2>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          <p className="profile-bio">{user?.bio || 'No bio yet'}</p>
          <div className="profile-stats">
            <div className="p-stat"><span className="p-stat-num">{user?.postsCount || 0}</span><span>Posts</span></div>
            <div className="p-stat"><span className="p-stat-num">{user?.commentsCount || 0}</span><span>Comments</span></div>
            <div className="p-stat"><span className="p-stat-num">{user?.reputation || 0}</span><span>Reputation</span></div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>My Posts</button>
        <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'posts' && (
        <div className="fade-in">
          {myPosts.length === 0 ? (
            <div className="empty-state"><h3>No posts yet</h3><p>Create your first decision post!</p></div>
          ) : (
            <div className="my-posts-list">
              {myPosts.map((p) => (
                <a key={p._id} href={`/posts/${p._id}`} className="my-post-item card">
                  <div>
                    <h4>{p.title}</h4>
                    <p className="my-post-meta">
                      <span className="tag">{p.category}</span>
                      <span>💬 {p.commentsCount}</span>
                      <span>👁 {p.views}</span>
                      <span>⬆ {p.upvotes?.length}</span>
                    </p>
                  </div>
                  <span className={`status-dot ${p.status}`} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="card settings-card fade-in">
          <h3>Edit Profile</h3>
          {msg && <div className={`save-msg ${msg.includes('!') ? 'success' : 'error'}`}>{msg}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell the community about yourself..."
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label>Avatar URL <span style={{ color: 'var(--text3)', fontSize: 12 }}>(External HTTP Link)</span></label>
              <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
