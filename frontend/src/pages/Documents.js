import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { documentAPI } from '../api';
import '../styles/Documents.css';

const Documents = ({ user, onLogout }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    file: null,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentAPI.list();
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData((prev) => ({ ...prev, file: files?.[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.department || !formData.file) {
      setError('Please fill all fields');
      return;
    }

    setUploadLoading(true);

    try {
      await documentAPI.upload(
        formData.title,
        formData.department,
        formData.file
      );
      setSuccess('Document uploaded successfully!');
      setFormData({ title: '', department: '', file: null });
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <div className="container">
        <div className="documents-page">
          <h1>📄 Document Management</h1>

          {/* Upload Section */}
          <div className="upload-section">
            <h2>Upload New Document</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <label>Document Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Company Handbook 2024"
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>File (PDF, DOCX, or TXT)</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleInputChange}
                  accept=".pdf,.docx,.txt"
                  required
                />
                {formData.file && (
                  <p className="file-info">📎 {formData.file.name}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploadLoading}
              >
                {uploadLoading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>

          {/* Documents List */}
          <div className="documents-section">
            <h2>Uploaded Documents</h2>

            {loading ? (
              <div className="loading">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <div className="documents-grid">
                {documents.map((doc) => (
                  <div key={doc.id} className="document-card">
                    <div className="doc-header">
                      <h3>📄 {doc.title}</h3>
                      <span className="doc-id">#{doc.id}</span>
                    </div>

                    <div className="doc-meta">
                      <p>
                        <strong>Department:</strong> {doc.department}
                      </p>
                      <p>
                        <strong>File:</strong> {doc.filename}
                      </p>
                      <p>
                        <strong>Uploaded by:</strong> {doc.uploaded_by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
