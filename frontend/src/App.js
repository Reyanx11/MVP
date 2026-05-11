import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { authAPI, chatAPI, documentAPI } from './api';

const departments = ['HR', 'Finance', 'IT', 'Employee'];

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { username: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeView, setActiveView] = useState('chat');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', role: 'Employee' });
  const [authError, setAuthError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [docsError, setDocsError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadForm, setUploadForm] = useState({ title: '', department: 'HR', file: null });
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'Admin';
  const visibleTabs = useMemo(() => ['chat', 'documents', ...(isAdmin ? ['upload'] : [])], [isAdmin]);

  useEffect(() => {
    if (!token) return;

    authAPI.getMe()
      .then((response) => {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      })
      .catch(() => handleLogout());
  }, [token]);

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  const handleLogin = (nextToken, userData) => {
    setToken(nextToken);
    setUser(userData);
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setMessages([]);
    setDocuments([]);
    setActiveView('chat');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        await authAPI.register(
          authForm.username.trim(),
          authForm.password,
          authForm.role
        );
      }

      const response = await authAPI.login(authForm.username.trim(), authForm.password);
      handleLogin(response.data.access_token, decodeToken(response.data.access_token));
    } catch (error) {
      if (Array.isArray(error.response?.data?.detail)) {
        setAuthError(error.response.data.detail.map((item) => item.msg).join(', '));
      } else {
        setAuthError(error.response?.data?.detail || error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setDocsError('');
    try {
      const response = await documentAPI.list();
      setDocuments(response.data);
    } catch (error) {
      setDocsError(error.response?.data?.detail || 'Could not load documents');
    }
  };

  const submitUpload = async (event) => {
    event.preventDefault();
    setUploadStatus('');
    setLoading(true);

    try {
      await documentAPI.upload(uploadForm.title, uploadForm.department, uploadForm.file);
      setUploadForm({ title: '', department: 'HR', file: null });
      setUploadStatus('Document uploaded and indexed.');
      await fetchDocuments();
      setActiveView('documents');
    } catch (error) {
      setUploadStatus(error.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setMessages((items) => [...items, { role: 'user', text: currentQuestion }]);
    setLoading(true);

    try {
      const response = await chatAPI.ask(currentQuestion, 5);
      setMessages((items) => [
        ...items,
        { role: 'assistant', text: response.data.answer, sources: response.data.sources || [] },
      ]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        { role: 'assistant', text: error.response?.data?.detail || 'Chat request failed', sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="auth-screen">
        <section className="auth-panel">
          <p className="eyebrow">Enterprise AI Knowledge Assistant</p>
          <h1>{authMode === 'login' ? 'Sign in' : 'Create account'}</h1>
          <form onSubmit={submitAuth} className="stack">
            <label>
              Username
              <input value={authForm.username} onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required />
            </label>
            {authMode === 'register' && (
              <label>
                Role
                <select value={authForm.role} onChange={(event) => setAuthForm({ ...authForm, role: event.target.value })}>
                  <option value="Admin">Admin</option>
                  {departments.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
              </label>
            )}
            {authError && <p className="notice error">{authError}</p>}
            <button disabled={loading}>{loading ? 'Working...' : authMode === 'login' ? 'Login' : 'Register and Login'}</button>
          </form>
          <button className="link-button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? 'Need an account?' : 'Already have an account?'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Knowledge Assistant</p>
          <h2>MVP Console</h2>
        </div>
        <nav>
          {visibleTabs.map((tab) => (
            <button key={tab} className={activeView === tab ? 'active' : ''} onClick={() => setActiveView(tab)}>
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{activeView === 'chat' ? 'Ask Documents' : activeView === 'upload' ? 'Upload Document' : 'Documents'}</h1>
            <p>{user?.username} - {user?.role}</p>
          </div>
          <button className="secondary" onClick={handleLogout}>Logout</button>
        </header>

        {activeView === 'chat' && (
          <section className="panel chat-panel">
            <div className="messages">
              {messages.length === 0 && <p className="empty">Ask a question based on uploaded documents.</p>}
              {messages.map((message, index) => (
                <article key={index} className={`message ${message.role}`}>
                  <p>{message.text}</p>
                  {message.sources?.length > 0 && (
                    <div className="sources">
                      {message.sources.map((source) => (
                        <div className="source" key={`${source.chunk_id}-${source.distance}`}>
                          <strong>{source.document_title}</strong>
                          <span>{source.department}</span>
                          <p>{source.content.slice(0, 220)}...</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
            <form onSubmit={askQuestion} className="question-form">
              <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about uploaded documents..." />
              <button disabled={loading || !question.trim()}>{loading ? 'Thinking...' : 'Ask'}</button>
            </form>
          </section>
        )}

        {activeView === 'documents' && (
          <section className="panel">
            <div className="section-header">
              <h2>Accessible Documents</h2>
              <button className="secondary" onClick={fetchDocuments}>Refresh</button>
            </div>
            {docsError && <p className="notice error">{docsError}</p>}
            <div className="document-grid">
              {documents.map((document) => (
                <article className="document-card" key={document.id}>
                  <strong>{document.title}</strong>
                  <span>{document.department}</span>
                  <p>{document.filename}</p>
                  <small>Uploaded by {document.uploaded_by}</small>
                </article>
              ))}
              {documents.length === 0 && <p className="empty">No documents available for this role.</p>}
            </div>
          </section>
        )}

        {activeView === 'upload' && isAdmin && (
          <section className="panel narrow">
            <h2>Upload and Index</h2>
            <form onSubmit={submitUpload} className="stack">
              <label>
                Title
                <input value={uploadForm.title} onChange={(event) => setUploadForm({ ...uploadForm, title: event.target.value })} required />
              </label>
              <label>
                Department
                <select value={uploadForm.department} onChange={(event) => setUploadForm({ ...uploadForm, department: event.target.value })}>
                  {departments.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
              </label>
              <label>
                File
                <input type="file" accept=".txt,.pdf,.docx" onChange={(event) => setUploadForm({ ...uploadForm, file: event.target.files?.[0] || null })} required />
              </label>
              {uploadStatus && <p className="notice">{uploadStatus}</p>}
              <button disabled={loading}>{loading ? 'Indexing...' : 'Upload'}</button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
