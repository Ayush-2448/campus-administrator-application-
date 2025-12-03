import "./styles.css";
export default function LeaveRequest() {
  return (
    <section className="grid" style={{maxWidth:880}}>
      <div className="card">
        <h3 className="section-title">New Leave Request</h3>
        <div className="grid2">
          <input className="input" placeholder="yyyy / mm / dd" />
          <input className="input" placeholder="yyyy / mm / dd" />
        </div>
        <textarea className="input" rows="4" placeholder="Please provide detailed reason for your leave..." style={{marginTop:12}}/>
        <input className="input" placeholder="Emergency contact number" style={{marginTop:12}}/>
        <div className="card" style={{marginTop:12,borderStyle:"dashed",textAlign:"center",color:"var(--muted)"}}>
          Drag & drop your files here<br/><button className="btn" style={{marginTop:8}}>Browse Files</button>
        </div>
        <button className="btn primary" style={{width:"100%",marginTop:12}}>Submit Leave Request</button>
      </div>

      <div className="card">
        <h3 className="section-title">Leave History</h3>
        <table className="table">
          <thead><tr><th>Request Date</th><th>Leave Period</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>Dec 15, 2023</td><td>Dec 20–25, 2023</td><td>Family Function</td><td><span className="badge green">Approved</span></td><td>›</td></tr>
            <tr><td>Nov 28, 2023</td><td>Dec 1–3, 2023</td><td>Medical Emergency</td><td><span className="badge red">Denied</span></td><td>›</td></tr>
            <tr><td>Oct 15, 2023</td><td>Oct 18–20, 2023</td><td>Personal Work</td><td><span className="badge">Pending</span></td><td>›</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
