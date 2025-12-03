// src/pages/student/Notifications.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { io } from "socket.io-client";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

/*
 Expected notification shape (example):
 {
   _id: "notifId",
   title: "Your profile was updated",
   body: "Staff added your student record.",
   meta: { studentId: "...", action: "student_record_created" },
   read: false,
   createdAt: "2025-10-24T10:00:00.000Z"
 }
*/

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch notifications from API
  async function fetchNotifications() {
    try {
      const res = await api.get("/api/notifications"); // backend: return notifications for logged-in user
      setNotifications(res.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  // Mark a single notification as read
  async function markAsRead(id) {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  }

  // Mark all notifications as read
  async function markAllRead() {
    try {
      await api.post(`/api/notifications/mark-all-read`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  }

  // Insert new notification at the top (dedupe by _id)
  function pushNotification(n) {
    setNotifications(prev => {
      if (!n || !n._id) return prev;
      if (prev.some(x => x._id === n._id)) return prev;
      return [n, ...prev];
    });
  }

  useEffect(() => {
    fetchNotifications();

    // Try to open a socket connection for realtime updates.
    // Backend must accept socket connections and use the incoming token for auth.
    try {
      const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const socket = io(base, {
        path: "/socket.io", // adjust if your server uses a custom path
        autoConnect: true,
        // pass token for server-side auth. Server must check socket.handshake.auth.token
        auth: {
          token: localStorage.getItem("token") || ""
        },
        transports: ["websocket"]
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.debug("Notifications socket connected", socket.id);
      });

      socket.on("notification", (payload) => {
        // payload is expected to be a notification object
        console.debug("Received notification", payload);
        pushNotification(payload);
      });

      socket.on("disconnect", (reason) => {
        console.debug("Socket disconnected", reason);
      });

      socket.on("connect_error", (err) => {
        console.warn("Socket connect error", err);
      });

    } catch (err) {
      console.warn("Socket.IO client init failed", err);
    }

    // Optional fallback: poll every 30s to update notifications (keeps UI fresh)
    pollRef.current = setInterval(fetchNotifications, 30_000);

    return () => {
      // cleanup
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="student-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>🔔 Notifications</h2>
          <p>Stay updated with the latest announcements and campus alerts.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600 }}>{unreadCount} unread</div>
          <div style={{ marginTop: 6 }}>
            <button className="btn-outline" onClick={markAllRead} disabled={notifications.length === 0}>
              Mark all read
            </button>
          </div>
        </div>
      </div>

      <div className="info-card" style={{ marginTop: 12 }}>
        {loading ? (
          <p>Loading notifications…</p>
        ) : error ? (
          <div className="error">{error}</div>
        ) : notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {notifications.map((n) => (
              <li key={n._id} style={{
                display: "flex",
                gap: 12,
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                background: n.read ? "#fff" : "#fff6f6",
                border: n.read ? "1px solid rgba(0,0,0,0.04)" : "1px solid rgba(211,47,47,0.12)"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 600, color: "#b71c1c" }}>{n.title || "Notification"}</div>
                    <div style={{ color: "#777", fontSize: 12 }}>{formatDate(n.createdAt)}</div>
                  </div>
                  <div style={{ marginTop: 6, color: "#333" }}>{n.body}</div>
                  {n.meta && Object.keys(n.meta).length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                      <strong>Meta:</strong> {JSON.stringify(n.meta)}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  {!n.read && (
                    <button className="btn-primary" onClick={() => markAsRead(n._id)}>Mark read</button>
                  )}
                  <button className="btn-outline" onClick={() => window.open(`/student/notifications/${n._id}`, "_blank")}>Details</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
