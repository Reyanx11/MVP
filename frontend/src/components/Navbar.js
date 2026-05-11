import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">📚 RAG Chatbot</div>
      <div className="navbar-menu">
        <Link
          to="/dashboard"
          className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/chat"
          className={`navbar-link ${isActive('/chat') ? 'active' : ''}`}
        >
          Chat
        </Link>
        {user?.role === 'Admin' && (
          <Link
            to="/documents"
            className={`navbar-link ${isActive('/documents') ? 'active' : ''}`}
          >
            Documents
          </Link>
        )}
        <span className="navbar-user">👤 {user?.username}</span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
