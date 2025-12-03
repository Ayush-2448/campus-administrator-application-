import "./styles.css";
export default function Dashboard() {
  return (
    <section className="grid">
      {/* Header + KPI tiles */}
      <div className="card">
        <h2 className="section-title" style={{marginBottom:8}}>Welcome back, Aryan</h2>
        <div className="sub">C Block Hostel</div>

        <div className="grid2" style={{marginTop:16}}>
          {/* Paid */}
          <div className="card">
            <div style={{display:"flex",gap:12}}>
              <div style={{flex:1}}>
                <div className="sub">Total Fees Paid</div>
                <div className="kpi">₹45,000</div>
                <div className="badge green" style={{marginTop:8}}>Paid</div>
              </div>
              <div className="icon-pill">G</div>
            </div>
          </div>
          {/* Due */}
          <div className="card">
            <div style={{display:"flex",gap:12}}>
              <div style={{flex:1}}>
                <div className="sub">Pending Amount</div>
                <div className="kpi">₹5,000</div>
                <div className="badge red" style={{marginTop:8}}>Due</div>
              </div>
              <div className="icon-pill">!</div>
            </div>
          </div>
          {/* Last entry */}
          <div className="card">
            <div style={{display:"flex",gap:12}}>
              <div style={{flex:1}}>
                <div className="sub">Last Entry</div>
                <div style={{fontSize:20,fontWeight:700}}>Today, 8:30 PM</div>
                <div className="badge green" style={{marginTop:8}}>Approved</div>
              </div>
              <div className="icon-pill">QR</div>
            </div>
          </div>
          {/* Mess menu */}
          <div className="card">
            <div style={{display:"flex",gap:12}}>
              <div style={{flex:1}}>
                <div className="sub">Today's Mess Menu</div>
                <div style={{fontWeight:700}}>Dinner: Rice, Dal, Paneer</div>
                <div className="sub">7:30 PM - 9:30 PM</div>
              </div>
              <div className="icon-pill">🍽</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs table full width */}
      <div className="card">
        <h3 className="section-title">Recent QR Logs</h3>
        <table className="table" style={{width:"100%"}}>
          <thead>
            <tr><th>Date & Time</th><th>Entry/Exit</th><th>Location</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>Today, 8:30 PM</td><td><span className="badge green">Entry</span></td><td>Main Gate</td><td><span className="badge green">Approved</span></td></tr>
            <tr><td>Today, 12:00 PM</td><td><span className="badge">Exit</span></td><td>Main Gate</td><td><span className="badge green">Approved</span></td></tr>
            <tr><td>Yesterday, 10:00 PM</td><td><span className="badge green">Entry</span></td><td>Main Gate</td><td><span className="badge green">Approved</span></td></tr>
            <tr><td>Yesterday, 7:00 AM</td><td><span className="badge">Exit</span></td><td>Main Gate</td><td><span className="badge green">Approved</span></td></tr>
            <tr><td>20 Jan, 8:30 PM</td><td><span className="badge green">Entry</span></td><td>Main Gate</td><td><span className="badge green">Approved</span></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
