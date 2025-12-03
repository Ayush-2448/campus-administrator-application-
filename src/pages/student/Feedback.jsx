import "./styles.css";
export default function Feedback() {
  return (
    <section className="grid" style={{maxWidth:880}}>
      <div className="card">
        <h3 className="section-title">Provide Feedback</h3>
        <div className="grid2" style={{gridTemplateColumns:"220px 1fr"}}>
          <select>
            <option>Mess</option><option>Maintenance</option><option>Hostel Administration</option><option>App / Portal</option>
          </select>
          <input className="input" placeholder="Subject (optional)" />
        </div>
        <div style={{marginTop:12}} className="sub">Rating: ★ ★ ★ ☆ ☆</div>
        <textarea className="input" rows="6" placeholder="Write your feedback..." style={{marginTop:12}}/>
        <div className="card" style={{marginTop:12,borderStyle:"dashed",textAlign:"center",color:"var(--muted)"}}>
          Drag & drop screenshots here or <u>browse</u><div className="sub">Max 5MB</div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:14}}>
          <button className="btn primary">Submit Feedback</button>
          <button className="btn">Reset</button>
        </div>
      </div>
    </section>
  );
}
