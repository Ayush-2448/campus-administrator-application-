// src/components/StudentSidebar.jsx
import React, { useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart2,
  Users,
  AlertTriangle,
  Layers,
  User,
  Bell,
  X
} from "lucide-react";
import {
  FaHome,
  FaMoneyBill,
  FaQrcode,
  FaUtensils,
  FaClipboardList,
  FaStickyNote,
  FaCog,
  FaComment
} from "react-icons/fa";

export default function StudentSidebar() {
  const menuItems = [
    { label: "Dashboard", icon: <FaHome size={18} />, path: "dashboard" },
    { label: "Attendance", icon: <BarChart2 size={18} />, path: "attendance" },
    { label: "Hostel", icon: <Users size={18} />, path: "hostel" },
    { label: "Complaints", icon: <AlertTriangle size={18} />, path: "complaints" },
    { label: "Parcels", icon: <Layers size={18} />, path: "parcels" },
    { label: "Guest House", icon: <User size={18} />, path: "guest-house" },
    { label: "Meals", icon: <FaUtensils size={18} />, path: "meals" },
    { label: "Notifications", icon: <Bell size={18} />, path: "notifications" },
    { label: "Fees", icon: <FaMoneyBill size={18} />, path: "fees" },
    { label: "QR Logs", icon: <FaQrcode size={18} />, path: "qr-logs" },
    { label: "Mess Menu", icon: <FaUtensils size={18} />, path: "mess-menu" },
    { label: "Leave Request", icon: <Bell size={18} />, path: "leave-request" },
    { label: "Notices", icon: <FaStickyNote size={18} />, path: "notices" },
    { label: "Settings", icon: <FaCog size={18} />, path: "settings" },
    { label: "Feedback", icon: <FaComment size={18} />, path: "feedback" },
  ];

  const closeSidebar = useCallback(() => {
    document.body.classList.remove("mobile-sidebar-open");
    window.dispatchEvent(new Event("closeSidebar"));
    window.dispatchEvent(new CustomEvent("sidebar:closed", { detail: { from: "student" } }));
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeSidebar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSidebar]);

  return (
    <aside id="app-sidebar" className="sidebar" aria-label="Student sidebar">
      <div
        className="sidebar-header"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <h2 style={{ margin: 0 }}>Student Dashboard</h2>
        <button
          className="hamburger"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-menu" role="navigation" aria-label="Student menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            {item.icon}
            <span style={{ marginLeft: 10 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
