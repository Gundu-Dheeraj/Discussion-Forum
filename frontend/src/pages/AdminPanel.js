import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import './AdminPanel.css';

const COLORS = ['#6c63ff', '#ff6584', '#43e97b', '#f7b731', '#00d2d3', '#ff9f43', '#8890a8'];

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, userSearch]);

  const loadStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch {}
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const { data } = await API.get(`/admin/users?search=${userSearch}`);
      setUsers(data.users);
    } catch {}
  };

  const toggleBan = async (userId, isBanned, username) => {
    const reason = isBanned ? '' : prompt(`Reason for banning ${username}:`);
    if (!isBanned && reason === null) return;
    try {
      await API.put(`/admin/users/${userId}/ban`, { isBanned: !isBanned, banReason: reason });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isBanned: !isBanned, banReason: reason } : u));
      setActionMsg(`User ${!isBanned ? 'banned' : 'unbanned'} successfully`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch {}
  };

  const changeRole = async (userId, role) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
      setActionMsg('Role updated');
      setTimeout(() => setActionMsg(''), 3000);
    } catch {}
  };

  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>👑 Admin Dashboard</h1>
        <p className="admin-sub">Full system overview and control</p>
      </div>

      {actionMsg && <div className="action-toast">{actionMsg}</div>}

      <div className="admin-tabs">
        {['overview', 'users', 'posts'].map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="fade-in">
          {/* KPI Cards */}
          <div className="kpi-grid">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6c63ff' },
              { label: 'Total Posts', value: stats.totalPosts, icon: '📝', color: '#43e97b' },
              { label: 'Comments', value: stats.totalComments, icon: '💬', color: '#ff6584' },
              { label: 'Pending Reports', value: stats.pendingReports, icon: '⚑', color: '#f7b731' },
              { label: 'Banned Users', value: stats.bannedUsers, icon: '🚫', color: '#ff4757' },
              { label: 'Flagged Posts', value: stats.flaggedPosts, icon: '🚩', color: '#ff9f43' },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi-card card">
                <div className="kpi-icon" style={{ color: kpi.color }}>{kpi.icon}</div>
                <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="kpi-label">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="card chart-card">
              <h3>Posts by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.postsByCategory}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.postsByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#161923', border: '1px solid #252a38', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart-card">
              <h3>Users by Role</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.userRoles} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252a38" />
                  <XAxis dataKey="_id" tick={{ fill: '#8890a8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#8890a8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#161923', border: '1px solid #252a38', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#6c63ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent users & posts */}
          <div className="recent-grid">
            <div className="card">
              <h3 className="sidebar-title">🆕 Recent Users</h3>
              {stats.recentUsers.map((u) => (
                <div key={u._id} className="recent-item">
                  <div className="recent-avatar">{u.username.slice(0, 1).toUpperCase()}</div>
                  <div className="recent-info">
                    <span className="recent-name">{u.username}</span>
                    <span className="recent-meta">{u.email}</span>
                  </div>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 className="sidebar-title">📝 Recent Posts</h3>
              {stats.recentPosts.map((p) => (
                <a key={p._id} href={`/posts/${p._id}`} className="recent-item" style={{ textDecoration: 'none' }}>
                  <div className="recent-info" style={{ flex: 1 }}>
                    <span className="recent-name">{p.title?.slice(0, 50)}{p.title?.length > 50 ? '...' : ''}</span>
                    <span className="recent-meta">by {p.author?.username} · {timeAgo(p.createdAt)}</span>
                  </div>
                  <span className={`status-dot ${p.status}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="fade-in">
          <div className="users-toolbar">
            <input
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); }}
              style={{ maxWidth: 300 }}
            />
          </div>
          <div className="users-table card">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className={u.isBanned ? 'banned-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="mini-avatar">{u.username?.slice(0, 1).toUpperCase()}</div>
                        {u.username}
                      </div>
                    </td>
                    <td className="email-cell">{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-chip ${u.isBanned ? 'status-banned' : 'status-active-user'}`}>
                        {u.isBanned ? '🚫 Banned' : '✓ Active'}
                      </span>
                    </td>
                    <td className="time-cell">{timeAgo(u.createdAt)}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isBanned ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => toggleBan(u._id, u.isBanned, u.username)}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="empty-state" style={{ padding: '30px' }}>No users found</div>}
          </div>
        </div>
      )}

      {tab === 'posts' && (
        <div className="fade-in">
          <p className="admin-sub" style={{ marginBottom: 16 }}>Use the <a href="/moderation">Moderation Panel</a> to manage flagged posts and reports.</p>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { label: 'Total Posts', value: stats?.totalPosts, icon: '📝' },
              { label: 'Flagged', value: stats?.flaggedPosts, icon: '🚩' },
              { label: 'Pending Reports', value: stats?.pendingReports, icon: '⚑' },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi-card card">
                <div className="kpi-icon">{kpi.icon}</div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-label">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
