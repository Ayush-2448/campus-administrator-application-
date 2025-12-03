import "./styles.css";
export default function Fees() {
  return (
    <section className="grid">
      <div className="card" style={{borderColor:"#f2c1c0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:28,fontWeight:800}}>₹12,500</div>
          <div className="sub">Total Pending Amount</div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Recent Fee Payments</h3>
        <table className="table">
          <thead><tr><th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Hostel Rent</td><td>₹8,000</td><td>Due: 15 Dec 2023</td><td><span className="badge red">Pending</span></td></tr>
            <tr><td>Mess Fee</td><td>₹3,500</td><td>Due: 10 Dec 2023</td><td><span className="badge red">Pending</span></td></tr>
            <tr><td>Security Deposit</td><td>₹5,000</td><td>Due: 1 Dec 2023</td><td><span className="badge green">Paid</span></td></tr>
          </tbody>
        </table>

        <div style={{display:"flex",gap:12,marginTop:16}}>
          <button className="btn primary">Pay Now</button>
          <button className="btn">Download Receipt</button>
        </div>
      </div>
    </section>
  );
}
