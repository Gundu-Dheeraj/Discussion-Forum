import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-logo">⚖ Discussion<strong>Forum</strong></div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to join the discussion</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.9rem' }}>Forgot Password?</Link>
        </div>

        <p className="auth-switch" style={{ marginTop: '0.5rem' }}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>

        <div className="auth-demo">
          <p className="demo-label">Demo credentials</p>
          <div className="demo-items">
            <button className="demo-btn" onClick={() => setForm({ email: 'admin@demo.com', password: 'demo1234' })}>
              👑 Admin
            </button>
            <button className="demo-btn" onClick={() => setForm({ email: 'mod@demo.com', password: 'demo1234' })}>
              🛡 Moderator
            </button>
            <button className="demo-btn" onClick={() => setForm({ email: 'user@demo.com', password: 'demo1234' })}>
              👤 User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
