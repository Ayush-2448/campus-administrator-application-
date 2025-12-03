import "./styles.css";
export default function QrLogs() {
  return (
    <section className="grid">
      <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span className="badge green">Currently Inside Hostel</span>
          <span className="sub">Last entry: Today, 8:45 PM</span>
          <div style={{marginLeft:"auto"}} className="icon-pill">?</div>
        </div>
      </div>

      <div className="card">
        <div className="grid2" style={{gridTemplateColumns:"260px 220px 1fr"}}>
          <input className="input" placeholder="Select date range" />
          <select><option>All Locations</option><option>Main Gate</option><option>Block Gate</option></select>
          <input className="input" placeholder="Search logs..." />
        </div>

        <table className="table" style={{marginTop:12}}>
          <thead><tr><th>Date</th><th>Time</th><th>Location</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>2024-01-20</td><td>20:45</td><td>Main Gate</td><td><span className="badge green">IN</span></td></tr>
            <tr><td>2024-01-20</td><td>14:30</td><td>Block Gate</td><td><span className="badge red">OUT</span></td></tr>
            <tr><td>2024-01-19</td><td>08:15</td><td>Main Gate</td><td><span className="badge green">IN</span></td></tr>
            <tr><td>2024-01-19</td><td>22:00</td><td>Block Gate</td><td><span className="badge red">OUT</span></td></tr>
            <tr><td>2024-01-18</td><td>07:30</td><td>Main Gate</td><td><span className="badge green">IN</span></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
