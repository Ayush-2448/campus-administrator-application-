import React from "react";

export default function Parcels() {
  return (
    <div className="student-page">
      <h2>📦 Parcels</h2>
      <p>Check the status of your parcel deliveries at the hostel reception.</p>

      <div className="info-card">
        <ul>
          <li>Amazon — Arrived (Collected)</li>
          <li>Flipkart — Awaiting Pickup</li>
        </ul>
      </div>
    </div>
  );
}
