import React from "react";

export default function Complaints() {
  return (
    <div className="student-page">
      <h2>⚠️ Complaints</h2>
      <p>Submit and track complaints related to hostel, academics, or mess.</p>

      <div className="info-card">
        <h3>Active Complaints</h3>
        <ul>
          <li>Leaking tap in washroom — <em>In Progress</em></li>
          <li>Mess food quality — <em>Resolved</em></li>
        </ul>
      </div>
    </div>
  );
}
