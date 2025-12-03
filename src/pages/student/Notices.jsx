import "./styles.css";
export default function Notices() {
  return (
    <section className="grid" style={{maxWidth:980}}>
      <div className="card">
        <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button className="btn">All Notices</button>
            <button className="btn" style={{color:"#b91c1c",background:"var(--primary-weak)",borderColor:"#ffcccc"}}>Urgent</button>
            <button className="btn">Mess Related</button>
            <button className="btn">Maintenance</button>
            <button className="btn">Academic</button>
          </div>
          <div style={{marginLeft:"auto",minWidth:280}}>
            <input className="input" placeholder="Search notices..." />
          </div>
        </div>
      </div>

      <div className="card" style={{borderColor:"#f2c1c0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span className="badge red">Urgent</span>
          <span className="sub">Today, 10:00 AM</span>
        </div>
        <h3 style={{margin:"10px 0 6px"}}>Emergency Maintenance: Water Supply Interruption</h3>
        <p className="sub">Due to essential maintenance work, water supply will be interrupted from 2 PM to 6 PM today. Please ensure you have sufficient water stored.</p>
        <div className="sub">Issued By: Maintenance Department</div>
        <div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}><a className="btn">Read More ›</a></div>
      </div>

      <div className="card">
        <div className="sub">Yesterday</div>
        <h3 style={{margin:"8px 0 6px"}}>Monthly Mess Committee Meeting</h3>
        <p className="sub">All mess committee representatives are requested to attend the monthly meeting scheduled for tomorrow at 4 PM in the mess hall.</p>
        <div className="sub">Issued By: Mess Secretary</div>
        <div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}><a className="btn">Read More ›</a></div>
      </div>

      <div className="card" style={{display:"flex",justifyContent:"center",gap:8}}>
        <a className="btn">‹ Previous</a>
        <a className="btn primary">1</a>
        <a className="btn">2</a><a className="btn">3</a><a className="btn">4</a><a className="btn">5</a>
        <a className="btn">Next ›</a>
      </div>
    </section>
  );
}
