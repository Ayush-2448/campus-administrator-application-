import React from "react";

export default function Attendance() {
  return (
    <div className="student-page">
      <h2>📊 Attendance</h2>
      <p>Track your class attendance records and subject-wise percentages.</p>

      <div className="info-card">
        <h3>Current Attendance</h3>
        <ul>
          <li>Data Science — 92%</li>
          <li>AI Fundamentals — 89%</li>
          <li>Mathematics — 95%</li>
        </ul>
      </div>
    </div>
  );
}
