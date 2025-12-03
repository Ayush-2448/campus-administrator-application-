// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// ---------- Auth pages ----------
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// ---------- Student imports ----------
import StudentLayout from "./layouts/StudentLayout";
import Attendance from "./pages/student/Attendance";
import Hostel from "./pages/student/Hostel";
import Complaints from "./pages/student/Complaints";
import Parcels from "./pages/student/Parcels";
import GuestHouse from "./pages/student/GuestHouse";
import Meals from "./pages/student/Meals";
import Notifications from "./pages/student/Notifications";
import EditStudentPage from "./pages/staff/EditStudent";
import Dashboard from "./pages/student/Dashboard";
import Fees from "./pages/student/Fees";
import QrLogs from "./pages/student/QrLogs";
import MessMenu from "./pages/student/MessMenu";
import LeaveRequest from "./pages/student/LeaveRequest";
import Notices from "./pages/student/Notices";
import Settings from "./pages/student/Settings";
import Feedback from "./pages/student/Feedback";

// ---------- Staff imports ----------
import StaffLayout from "./layouts/StaffLayout";
import StaffAnalytics from "./pages/staff/Analytics";
import StaffStudents from "./pages/staff/Students";
import StaffComplaints from "./pages/staff/Complaints";
import StaffStock from "./pages/staff/Stock";
import StaffUsers from "./pages/staff/Users";
import StaffMeals from "./pages/staff/Meals";

export default function App() {
  return (
    <div className="app-root">
      <Navbar />

      {/* Public area (login/signup). Dashboard layouts handle their own sidebars. */}
      <main className="container" style={{ padding: 0 }}>
        <Routes>
          {/* ---------- Public Routes ---------- */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ---------- STUDENT ROUTES ----------
              NOTE: Parent route path is *relative* (no leading slash) to avoid ambiguity
                    in nested routes. Child routes must be relative (no leading slash).
          */}
          <Route
            path="student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            {/* /student -> Attendance (index) */}
            <Route index element={<Attendance />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="hostel" element={<Hostel />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="parcels" element={<Parcels />} />
            <Route path="guest-house" element={<GuestHouse />} />
            <Route path="meals" element={<Meals />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="fees" element={<Fees />} />
            <Route path="qr-logs" element={<QrLogs />} />
            <Route path="mess-menu" element={<MessMenu />} />
            <Route path="leave-request" element={<LeaveRequest />} />
            <Route path="notices" element={<Notices />} />
            <Route path="settings" element={<Settings />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>

          {/* ---------- STAFF ROUTES ---------- */}
          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffAnalytics />} />
            <Route path="analytics" element={<StaffAnalytics />} />
            <Route path="students" element={<StaffStudents />} />
            <Route path="complaints" element={<StaffComplaints />} />
            <Route path="stock" element={<StaffStock />} />
            <Route path="users" element={<StaffUsers />} />
            <Route path="meals" element={<StaffMeals />} />
            <Route path="students/:id/edit" element={<EditStudentPage />} />
          </Route>

          {/* ---------- 404 fallback ---------- */}
          <Route
            path="*"
            element={<div style={{ padding: 20 }}>404 — Page not found</div>}
          />
        </Routes>
      </main>
    </div>
  );
}
