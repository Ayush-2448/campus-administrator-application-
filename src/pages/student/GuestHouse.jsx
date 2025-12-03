import React from "react";

export default function GuestHouse() {
  return (
    <div className="student-page">
      <h2>🏡 Guest House</h2>
      <p>Book rooms for guests visiting the campus.</p>

      <div className="info-card">
        <button className="btn-primary">Book a Room</button>
        <p style={{ marginTop: "10px" }}>
          *Guest house bookings are subject to availability.
        </p>
      </div>
    </div>
  );
}
