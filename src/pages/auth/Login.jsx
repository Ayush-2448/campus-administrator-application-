// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { saveToken, isAuthenticated, getUserFromToken } from '../../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nav = useNavigate();

  // Run redirect logic inside useEffect so navigate() is not called during render
  useEffect(() => {
    if (!isAuthenticated()) return;

    try {
      const user = getUserFromToken();
      if (user?.role === 'student') nav('/student');
      else if (user?.role === 'staff') nav('/staff');
      else nav('/');
    } catch (err) {
      // If token parsing fails, don't block the UI — let user login.
      console.warn('Failed to derive user from token during initial redirect', err);
    }
    // We intentionally do not include getUserFromToken/isAuthenticated in deps:
    // nav is stable from react-router and this effect only needs to run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token } = res.data;

      if (!token) {
        setError('No token returned from server');
        return;
      }

      saveToken(token);

      // Derive user and navigate. This is happening in an event handler
      // (not during render), so calling navigate here is safe.
      const user = getUserFromToken();
      if (user?.role === 'student') nav('/student');
      else if (user?.role === 'staff') nav('/staff');
      else nav('/');
    } catch (err) {
      console.error('Login error', err);
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>Email</label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
        />

        <label>Password</label>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="••••••"
        />

        {error && <div className="error">{error}</div>}

        <button className="btn-primary" disabled={loading}>
          {loading ? 'Logging...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
