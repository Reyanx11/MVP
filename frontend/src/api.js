import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (username, password, role) =>
    api.post('/auth/register', { username, password, role }),
  
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  getMe: () => api.get('/auth/me'),
};

// Document APIs
export const documentAPI = {
  upload: (title, department, file) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('department', department);
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  list: () => api.get('/documents/docs-list'),
  
  search: (question, top_k = 5) =>
    api.post('/documents/search', { question, top_k }),
  
  adminCheck: () => api.get('/documents/admin-check'),
};

// Chat APIs
export const chatAPI = {
  ask: (question, top_k = 5) =>
    api.post('/chat/ask', { question, top_k }),
};

export default api;
