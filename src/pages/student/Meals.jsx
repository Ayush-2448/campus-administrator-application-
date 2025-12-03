import "./styles.css";
import React from "react";

export default function Meals() {
  return (
    <div className="student-page">
      <h2>🍽️ Meals</h2>
      <p>Check the daily mess menu and meal timings.</p>

      <div className="info-card">
        <h3>Today's Menu</h3>
        <ul>
          <li>Breakfast: Poha, Tea</li>
          <li>Lunch: Paneer Butter Masala, Rice</li>
          <li>Dinner: Dal Tadka, Chapati</li>
        </ul>
      </div>
    </div>
  );
}
