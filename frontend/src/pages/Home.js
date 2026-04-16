import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import PostCard from '../components/PostCard';
import './Home.css';

const CATEGORIES = ['All', 'Career', 'Tech', 'Life', 'Education', 'Finance', 'Health', 'Other'];
const SORTS = [
  { value: 'latest', label: '🕒 Latest' },
  { value: 'top', label: '⬆ Top Voted' },
  { value: 'trending', label: '🔥 Trending' },
];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, sort });
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      const { data } = await API.get(`/posts?${params}`);
      setPosts(data.posts || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch { }
    setLoading(false);
  }, [page, category, sort, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    API.get('/posts/stats/overview').then(({ data }) => setStats(data)).catch(() => { });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="home-layout">
      <main className="home-main">
        {/* Hero */}
        <div className="hero">
          <h1 className="hero-title">Make Better <span>Discussions</span><br />Together</h1>
          <p className="hero-sub">Post your dilemmas, get community insights, vote on outcomes.</p>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search discussions, topics, tags..."
            />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="cat-filters">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`cat-btn ${category === c ? 'active' : ''}`}
                onClick={() => { setCategory(c); setPage(1); }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="sort-filters">
            {SORTS.map((s) => (
              <button
                key={s.value}
                className={`sort-btn ${sort === s.value ? 'active' : ''}`}
                onClick={() => { setSort(s.value); setPage(1); }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts found</h3>
            <p>Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >← Prev</button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >Next →</button>
          </div>
        )}
      </main>

      {/* Sidebar */}
      <aside className="home-sidebar">
        {stats && (
          <div className="card sidebar-stats">
            <h3 className="sidebar-title">📊 Forum Stats</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-num">{stats.totalPosts}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{stats.totalUsers}</span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{stats.totalComments}</span>
                <span className="stat-label">Comments</span>
              </div>
            </div>
          </div>
        )}

        {stats?.trending?.length > 0 && (
          <div className="card">
            <h3 className="sidebar-title">🔥 Trending</h3>
            {stats.trending.map((p, i) => (
              <a key={p._id} href={`/posts/${p._id}`} className="trending-item">
                <span className="trend-rank">{i + 1}</span>
                <div className="trend-content">
                  <span className="trend-title">{p.title}</span>
                  <span className="trend-views">👁 {p.views}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {stats?.categoryStats?.length > 0 && (
          <div className="card">
            <h3 className="sidebar-title">📁 Categories</h3>
            {stats.categoryStats.map((c) => (
              <div key={c._id} className="cat-stat-item">
                <span>{c._id}</span>
                <span className="cat-stat-count">{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
