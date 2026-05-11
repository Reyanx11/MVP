import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { documentAPI } from '../api';
import '../styles/Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    documentsCount: 0,
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'Admin') {
          const docsResponse = await documentAPI.list();
          setStats({
            documentsCount: docsResponse.data.length,
            isAdmin: true,
          });
        } else {
          const docsResponse = await documentAPI.list();
          setStats({
            documentsCount: docsResponse.data.length,
            isAdmin: false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <div className="container">
        <div className="dashboard">
          <h1>Welcome, {user?.username}! 👋</h1>
          <p className="role-badge">Role: {user?.role}</p>

          {loading ? (
            <div className="loading">Loading dashboard...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <h3>Documents</h3>
                <p className="stat-value">{stats.documentsCount}</p>
                <p className="stat-label">Uploaded files</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <h3>Chat</h3>
                <p className="stat-value">Active</p>
                <p className="stat-label">Ask questions about docs</p>
              </div>

              {user?.role === 'Admin' && (
                <div className="stat-card">
                  <div className="stat-icon">⚙️</div>
                  <h3>Admin Panel</h3>
                  <p className="stat-value">Full</p>
                  <p className="stat-label">Upload & manage documents</p>
                </div>
              )}

              <div className="stat-card">
                <div className="stat-icon">🔍</div>
                <h3>Search</h3>
                <p className="stat-value">Semantic</p>
                <p className="stat-label">AI-powered search</p>
              </div>
            </div>
          )}

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <a href="/chat" className="action-btn">
                <span className="action-icon">💬</span>
                <span>Start Chatting</span>
              </a>
              {user?.role === 'Admin' && (
                <a href="/documents" className="action-btn">
                  <span className="action-icon">📤</span>
                  <span>Upload Document</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
