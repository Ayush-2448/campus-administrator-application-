import "./styles.css";
import { FaUtensils, FaClock, FaLeaf, FaStar, FaRegStar } from "react-icons/fa";

function Meal({ title, time, current, items }) {
  return (
    <div className="card" style={{padding:"18px 18px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="icon-pill"><FaUtensils/></div>
          <div style={{fontWeight:700}}>{title}</div>
          {current && <span className="badge green" style={{padding:"2px 8px",fontSize:11}}>Current Meal</span>}
        </div>
        <div className="sub" style={{display:"flex",alignItems:"center",gap:8}}>
          <FaClock/> {time}
        </div>
      </div>

      <ul style={{listStyle:"none",padding:0,margin:"8px 0 0",display:"grid",gap:8}}>
        {items.map(i=>(
          <li key={i} className="sub" style={{display:"flex",gap:8,alignItems:"center"}}>
            <FaLeaf color="#22c55e"/>{i}
          </li>
        ))}
      </ul>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid var(--border)",marginTop:14,paddingTop:10}}>
        <div className="sub">
          Rate this meal: <FaStar color="#facc15"/><FaStar color="#facc15"/><FaStar color="#facc15"/><FaRegStar/><FaRegStar/>
        </div>
        <div className="sub" style={{color:"var(--primary)",fontWeight:600,cursor:"pointer"}}>Provide Feedback</div>
      </div>
    </div>
  );
}

export default function MessMenu() {
  return (
    <section style={{maxWidth:1040}}>
      <div className="card" style={{background:"#f7f8fa",borderColor:"#eef0f3",height:44,display:"flex",alignItems:"center"}}>
        <div className="sub" style={{fontWeight:600,color:"#4b5563"}}>Today's Menu</div>
      </div>

      <Meal title="Breakfast" time="8:00 AM - 9:30 AM" current items={["Masala Dosa","Sambar","Coconut Chutney","Fresh Fruits","Tea/Coffee"]}/>
      <Meal title="Lunch" time="12:30 PM - 2:00 PM" items={["Rice","Dal Tadka","Mixed Vegetable Curry","Chapati","Raita","Salad"]}/>
      <Meal title="Dinner" time="7:30 PM - 9:00 PM" items={["Jeera Rice","Dal Makhani","Paneer Butter Masala","Naan","Sweet (Gulab Jamun)"]}/>
    </section>
  );
}
