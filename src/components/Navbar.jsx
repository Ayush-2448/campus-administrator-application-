// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  clearToken,
  getUserFromToken,
} from "../utils/auth";

export default function Navbar() {
  const nav = useNavigate();
  const logged = isAuthenticated();
  const user = logged ? getUserFromToken() : null;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  async function logout() {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (e) {
      // ignore
    } finally {
      clearToken();
      nav("/login");
    }
  }

  // sync body class for off-canvas behaviour
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("mobile-sidebar-open");
    else document.body.classList.remove("mobile-sidebar-open");
    return () => document.body.classList.remove("mobile-sidebar-open");
  }, [sidebarOpen]);

  // listen for sidebars closing from other components
  useEffect(() => {
    function handleCloseEvent() {
      setSidebarOpen(false);
    }
    window.addEventListener("closeSidebar", handleCloseEvent);
    return () => window.removeEventListener("closeSidebar", handleCloseEvent);
  }, []);

  // close avatar dropdown on outside click or Esc
  useEffect(() => {
    function onDoc(e) {
      if (!avatarRef.current) return;
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "click" && avatarRef.current.contains(e.target)) return;
      setAvatarOpen(false);
    }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onDoc);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onDoc);
    };
  }, []);

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map(s => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="mobile-top" role="banner">
        <button
          className="hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
        >
          ☰
        </button>
        <div className="mobile-brand">
          <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}>
            AuthApp
          </Link>
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* render overlay only when sidebar open */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          role="button"
          aria-hidden={!sidebarOpen}
          aria-label="Close sidebar"
        />
      )}

      <nav className="nav" role="navigation" aria-label="Main navigation">
        <div className="nav-left">
          <Link to="/">AuthApp</Link>
        </div>

        <div className="nav-right">
          {logged ? (
            <>
              {/* show simple email/name on wide screens */}
              <span className="nav-user" title={user?.email || user?.name || "Me"}>
                {user?.email || user?.name || "Me"}
              </span>
              <span className="nav-role">{user?.role ? `(${user.role})` : ""}</span>

              {/* Avatar + dropdown */}
              <div className="avatar-wrap" ref={avatarRef}>
                <button
                  className="avatar"
                  onClick={() => setAvatarOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={avatarOpen}
                  aria-label="User menu"
                >
                  {initials}
                </button>

                {avatarOpen && (
                  <div className="avatar-dropdown" role="menu">
                    <button
                      className="dropdown-item"
                      onClick={() => { setAvatarOpen(false); nav('/profile'); }}
                      role="menuitem"
                    >
                      Profile
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => { setAvatarOpen(false); nav('/settings'); }}
                      role="menuitem"
                    >
                      Settings
                    </button>
                    <div className="dropdown-sep" />
                    <button
                      className="dropdown-item"
                      onClick={logout}
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

            </>
          ) : (
            <>
              <Link to="/login" className="btn-link">Login</Link>
              <Link to="/signup" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
