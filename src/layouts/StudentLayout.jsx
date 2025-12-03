// src/layouts/StudentLayout.jsx
import React from "react";
import Sidebar from "../components/StudentSidebar";
import { Outlet } from "react-router-dom";

export default function StudentLayout() {
  return (
    <div className="student-layout">
      <Sidebar />
      <div className="student-content">
        <Outlet />
      </div>
    </div>
  );
}
