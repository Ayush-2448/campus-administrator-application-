import React from "react";

export default function StaffAnalytics() {
  return (
    <div className="staff-page">
      <h2>📊 Analytics</h2>
      <p>View key statistics about attendance, hostels, and meal consumption.</p>

      <div className="info-card">
        <ul>
          <li>Total Students: 480</li>
          <li>Average Attendance: 88%</li>
          <li>Complaints Resolved: 120</li>
        </ul>
      </div>
    </div>
  );
}
