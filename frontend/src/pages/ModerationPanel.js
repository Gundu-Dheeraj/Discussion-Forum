import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import './ModerationPanel.css';

const STATUS_TABS = ['Pending', 'Reviewed', 'Action Taken', 'Dismissed', 'all'];

export default function ModerationPanel() {
  const [reports, setReports] = useState([]);
  const [flagged, setFlagged] = useState({ flaggedPosts: [], flaggedComments: [] });
  const [tab, setTab] = useState('reports');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (tab === 'reports') loadReports();
    else loadFlagged();
  }, [tab, statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/reports?status=${statusFilter}`);
      setReports(data.reports);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  const loadFlagged = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/flagged');
      setFlagged(data);
    } catch {}
    setLoading(false);
  };

  const updateReport = async (id, status) => {
    try {
      await API.put(`/reports/${id}`, { status, reviewNote: `Reviewed by moderator` });
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch {}
  };

  const updatePostStatus = async (postId, status) => {
    try {
      await API.put(`/admin/posts/${postId}/status`, { status });
      setFlagged((prev) => ({
        ...prev,
        flaggedPosts: prev.flaggedPosts.filter((p) => p._id !== postId),
      }));
    } catch {}
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="mod-page">
      <div className="mod-header">
        <h1>🛡 Moderation Panel</h1>
        <p className="mod-sub">Review reports and flagged content</p>
      </div>

      <div className="mod-tabs">
        <button className={`tab-btn ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
          Reports {statusFilter === 'Pending' && total > 0 && <span className="tab-badge">{total}</span>}
        </button>
        <button className={`tab-btn ${tab === 'flagged' ? 'active' : ''}`} onClick={() => setTab('flagged')}>
          Auto-Flagged <span className="tab-badge">{flagged.flaggedPosts.length + flagged.flaggedComments.length}</span>
        </button>
      </div>

      {tab === 'reports' && (
        <>
          <div className="status-filter-row">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                className={`status-filter-btn ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <h3>No {statusFilter === 'all' ? '' : statusFilter.toLowerCase()} reports</h3>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((r) => (
                <div key={r._id} className="report-card card fade-in">
                  <div className="report-header">
                    <div className="report-type-badge" data-type={r.targetType}>{r.targetType}</div>
                    <span className="reason-badge">{r.reason}</span>
                    <span className={`status-chip status-${r.status.replace(' ', '-').toLowerCase()}`}>{r.status}</span>
                    <span className="report-time">{timeAgo(r.createdAt)}</span>
                  </div>
                  <p className="report-desc">{r.description || 'No additional details provided.'}</p>
                  <div className="report-meta">
                    <span>Reported by: <strong>{r.reporter?.username}</strong></span>
                    <span>Target ID: <code>{r.targetId}</code></span>
                  </div>
                  {r.status === 'Pending' && (
                    <div className="report-actions">
                      <button className="btn btn-success btn-sm" onClick={() => updateReport(r._id, 'Action Taken')}>
                        ✓ Take Action
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => updateReport(r._id, 'Reviewed')}>
                        👁 Mark Reviewed
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => updateReport(r._id, 'Dismissed')}>
                        ✕ Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'flagged' && (
        <div>
          {flagged.flaggedPosts.length > 0 && (
            <>
              <h3 className="section-label">⚑ Flagged Posts ({flagged.flaggedPosts.length})</h3>
              <div className="reports-list">
                {flagged.flaggedPosts.map((p) => (
                  <div key={p._id} className="report-card card fade-in">
                    <h4 className="flagged-title">{p.title}</h4>
                    <p className="flagged-desc">{p.description?.slice(0, 150)}...</p>
                    <div className="report-meta">
                      <span>By: <strong>{p.author?.username}</strong></span>
                      <span className="tag">{p.category}</span>
                    </div>
                    <div className="report-actions">
                      <a href={`/posts/${p._id}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">👁 View</a>
                      <button className="btn btn-success btn-sm" onClick={() => updatePostStatus(p._id, 'active')}>✓ Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => updatePostStatus(p._id, 'removed')}>🚫 Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {flagged.flaggedPosts.length === 0 && flagged.flaggedComments.length === 0 && (
            <div className="empty-state"><h3>No flagged content</h3><p>All clear! 🎉</p></div>
          )}
        </div>
      )}
    </div>
  );
}
