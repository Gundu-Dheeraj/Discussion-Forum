import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setMessage(data.message || 'If an account exists with that email, we have sent link to reset password');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-logo">⚖ Decision<strong>Forge</strong></div>
        <h2 className="auth-title">Forgot Password?</h2>
        <p className="auth-sub">Enter your email and we'll send you a link to reset your password.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success" style={{ 
          background: 'rgba(46, 213, 115, 0.1)', 
          border: '1px solid rgba(46, 213, 115, 0.3)', 
          color: '#2ed573', 
          padding: '10px 14px', 
          borderRadius: 'var(--radius-sm)', 
          fontSize: '13px', 
          marginBottom: '16px' 
        }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}