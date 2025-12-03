// src/layouts/StaffLayout.jsx
import React from "react";
import StaffSidebar from "../components/StaffSidebar";
import { Outlet } from "react-router-dom";

export default function StaffLayout() {
  return (
    <div className="staff-layout">
      <StaffSidebar />
      <div className="staff-content">
        <Outlet />
      </div>
    </div>
  );
}
