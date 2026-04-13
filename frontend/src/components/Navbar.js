import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isMod, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifs();
  }, [user, location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifs = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifs(data.notifications);
      setUnread(data.unreadCount);
    } catch { }
  };

  const markAllRead = async () => {
    await API.put('/notifications/read-all');
    setUnread(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMenu(false);
  };

  const initials = user?.username?.slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚖</span>
          <span className="logo-text">discussion<strong>Forum</strong></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Forum</Link>
          {isMod && <Link to="/moderation" className={location.pathname === '/moderation' ? 'nav-link active' : 'nav-link'}>Moderation</Link>}
          {isAdmin && <Link to="/admin" className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}>Admin</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/create" className="btn btn-primary btn-sm">+ New Post</Link>

              <div className="notif-wrap" ref={notifRef}>
                <button className="notif-btn" onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}>
                  🔔 {unread > 0 && <span className="notif-badge">{unread}</span>}
                </button>
                {showNotifs && (
                  <div className="notif-dropdown">
                    <div className="notif-header">Notifications</div>
                    {notifs.length === 0 ? (
                      <div className="notif-empty">No notifications</div>
                    ) : (
                      notifs.map((n) => (
                        <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                          <span className="notif-msg">{n.message}</span>
                          <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="user-menu-wrap">
                <button className="avatar-btn" onClick={() => setShowMenu(!showMenu)}>
                  <div className="avatar">{initials}</div>
                  <span className="username-display">{user.username}</span>
                </button>
                {showMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="avatar lg">{initials}</div>
                      <div>
                        <div className="uname">{user.username}</div>
                        <span className={`badge badge-${user.role}`}>{user.role}</span>
                      </div>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowMenu(false)}>👤 Profile</Link>
                    <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
