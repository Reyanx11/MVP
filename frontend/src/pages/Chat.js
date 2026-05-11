import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { chatAPI } from '../api';
import '../styles/Chat.css';

const Chat = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(5);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { type: 'user', content: userMessage },
    ]);
    setLoading(true);

    try {
      const response = await chatAPI.ask(userMessage, topK);
      const { answer, sources } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: answer,
          sources,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          content: error.response?.data?.detail || 'Failed to get response',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <div className="container">
        <div className="chat-container">
          <div className="chat-header">
            <h1>💬 Ask Questions</h1>
            <p>Ask questions about uploaded documents</p>
            
            <div className="chat-settings">
              <label>
                Top Results:
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">💭</div>
                <p>Start a conversation by asking a question!</p>
              </div>
            )}

            {messages.map((message, idx) => (
              <div key={idx} className={`message message-${message.type}`}>
                <div className="message-content">
                  {message.content}

                  {message.sources && message.sources.length > 0 && (
                    <div className="sources">
                      <h4>📚 Sources:</h4>
                      {message.sources.map((source, sourceIdx) => (
                        <div key={sourceIdx} className="source-item">
                          <p className="source-title">
                            {source.document_title} ({source.department})
                          </p>
                          <p className="source-preview">
                            {source.content.substring(0, 150)}...
                          </p>
                          <span className="source-distance">
                            Relevance: {(1 - source.distance).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message message-loading">
                <div className="loading-spinner"></div>
                <p>Thinking...</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
