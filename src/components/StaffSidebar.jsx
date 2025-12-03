// src/components/StaffSidebar.jsx
import React, { useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart2,
  Users,
  AlertTriangle,
  Layers,
  User,
  Utensils,
  X
} from "lucide-react";

export default function StaffSidebar() {
  const items = [
    { label: "Analytics", icon: <BarChart2 size={18} />, path: "/staff/analytics" },
    { label: "Students", icon: <Users size={18} />, path: "/staff/students" },
    { label: "Complaints", icon: <AlertTriangle size={18} />, path: "/staff/complaints" },
    { label: "Stock", icon: <Layers size={18} />, path: "/staff/stock" },
    { label: "Users", icon: <User size={18} />, path: "/staff/users" },
    { label: "Meals", icon: <Utensils size={18} />, path: "/staff/meals" },
  ];

  const closeSidebar = useCallback(() => {
    // remove mobile-visible class
    document.body.classList.remove("mobile-sidebar-open");
    // let navbar know (keeps its internal state in sync)
    window.dispatchEvent(new Event("closeSidebar"));
    // also dispatch a custom for completeness
    window.dispatchEvent(new CustomEvent("sidebar:closed", { detail: { from: "staff" } }));
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeSidebar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSidebar]);

  return (
    <aside id="app-sidebar" className="staff-sidebar" aria-label="Staff navigation">
      <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Staff Dashboard</h2>
        <button
          className="hamburger"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-menu" role="navigation" aria-label="Staff menu">
        {items.map((it) => (
          <NavLink
            key={it.label}
            to={it.path}
            className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
            onClick={closeSidebar}
          >
            {it.icon}
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
