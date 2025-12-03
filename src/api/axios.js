// src/api/axios.js
import axios from 'axios';
import { clearToken } from '../utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

// attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// global response handler: if unauthorized, clear token and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        clearToken();
        // best-effort navigation: replace location
        window.location.href = `${import.meta.env.BASE_URL || '/'}login`;
      } catch (e) {
        // swallow
      }
    }
    return Promise.reject(err);
  }
);

export default api;
