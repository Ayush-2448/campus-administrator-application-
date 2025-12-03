import "./styles.css";
export default function Settings() {
  return (
    <section className="grid" style={{maxWidth:980}}>
      <div className="card">
        <h3 className="section-title">Profile</h3>
        <div className="grid2" style={{gridTemplateColumns:"96px 1fr 1fr"}}>
          <div className="avatar" style={{width:72,height:72,fontSize:20}}>A</div>
          <div><div className="sub">Full Name</div><input className="input" defaultValue="Aryan"/></div>
          <div><div className="sub">Room / Block</div><input className="input" defaultValue="C-304, C Block"/></div>
        </div>
        <div className="grid2" style={{marginTop:12}}>
          <div><div className="sub">Email</div><input className="input" defaultValue="aryan@example.com"/></div>
          <div><div className="sub">Phone</div><input className="input" defaultValue="+91 98765 43210"/></div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:14}}>
          <button className="btn primary">Save Changes</button>
          <button className="btn">Reset</button>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Password</h3>
        <div className="grid2" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
          <input className="input" type="password" placeholder="Current password"/>
          <input className="input" type="password" placeholder="New password"/>
          <input className="input" type="password" placeholder="Confirm new password"/>
        </div>
        <button className="btn primary" style={{marginTop:12}}>Update Password</button>
      </div>

      <div className="card">
        <h3 className="section-title">Notifications</h3>
        <div className="grid2" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
          <label className="card" style={{display:"flex",alignItems:"center",gap:10}}><input type="checkbox" defaultChecked/> Email Alerts</label>
          <label className="card" style={{display:"flex",alignItems:"center",gap:10}}><input type="checkbox" defaultChecked/> SMS Alerts</label>
          <label className="card" style={{display:"flex",alignItems:"center",gap:10}}><input type="checkbox"/> WhatsApp Alerts</label>
        </div>
        <button className="btn primary" style={{marginTop:12}}>Save Preferences</button>
      </div>

      <div className="card">
        <h3 className="section-title">Danger Zone</h3>
        <p className="sub">If you suspect account compromise, sign out from all devices.</p>
        <button className="btn" style={{borderColor:"#ffd3d3",background:"var(--primary-weak)",color:"#b91c1c"}}>Sign out all devices</button>
      </div>
    </section>
  );
}
