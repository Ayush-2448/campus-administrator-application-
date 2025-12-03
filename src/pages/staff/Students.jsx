import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { printStudentProfile } from "../../utils/printUtils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import api from "../../api/axios";
import AddStudentWizard from "../../components/AddStudentWizard";

export default function StaffStudentsWithCharts() {
  const [students, setStudents] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("fetchStudents:", err);
      setError("Failed to load students. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  function handleSaved(newStudent) {
    if (!newStudent || !newStudent._id) return;
    setStudents((prev) => {
      const found = prev.find((p) => p._id === newStudent._id);
      if (found) return prev.map((p) => (p._id === newStudent._id ? newStudent : p));
      return [newStudent, ...prev];
    });
  }

  function handleEdit(student) {
    nav(`/staff/students/${student._id}/edit`, { state: { student } });
  }

  // --- Charts data transforms ---
  const deptBarData = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      const d = s.department || "Unknown";
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [students]);

  const hostelPieData = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      const h = s.hostel || "Not Assigned";
      map.set(h, (map.get(h) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [students]);

  // New-students timeline (last 14 days)
  const timelineData = useMemo(() => {
    const days = 14;
    const counts = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      counts[key] = 0;
    }

    students.forEach((s) => {
      const created = s.createdAt || s.created || s.registeredAt || s._createdAt;
      if (!created) return;
      const d = new Date(created);
      if (Number.isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      if (counts[key] !== undefined) counts[key] += 1;
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [students]);

  // focused red-first palette for theme consistency
  const COLORS = ["#d32f2f", "#b71c1c", "#ef4444", "#f59e0b", "#06b6d4", "#10b981", "#8b5cf6"];

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>👩‍🎓 Student Management</h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--muted)' }}>Profiles, charts and quick actions.</p>
        </div>

        <div className="header-controls">
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="btn-outline"
            aria-label="Refresh students"
            title="Refresh students"
          >
            ⟳ Refresh
          </button>

          <button
            onClick={() => setShowWizard(true)}
            className="btn-primary"
            aria-label="Add student"
            title="Add student"
          >
            ➕ Add Student
          </button>
        </div>
      </div>

      {/* Add student modal/wizard */}
      {showWizard && (
        <AddStudentWizard
          onClose={() => setShowWizard(false)}
          onSaved={(s) => {
            handleSaved(s);
            setShowWizard(false);
          }}
        />
      )}

      {/* Error toast-like row */}
      {error && (
        <div style={{ marginBottom: 12 }}>
          <div className="info-card" style={{ background: '#fff5f5', border: '1px solid #fde2e2', color: '#8a1f1f' }}>
            {error}
          </div>
        </div>
      )}

      {/* Compact card grid for charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 14 }}>
        <div className="info-card" style={{ padding: 12, minHeight: 140, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ margin: 0, fontSize: 13 }}>Students by Department</h4>
            <small style={{ color: 'var(--muted)' }}>{deptBarData.length} groups</small>
          </div>

          <div style={{ flex: 1, minHeight: 100 }}>
            {deptBarData.length === 0 ? (
              <div style={{ color: '#888', fontSize: 13 }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={deptBarData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} hide={true} />
                  <Tooltip wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill={COLORS[0]} barSize={12} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="info-card" style={{ padding: 12, minHeight: 140 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ margin: 0, fontSize: 13 }}>Hostel Occupancy</h4>
            <small style={{ color: 'var(--muted)' }}>{hostelPieData.length} hostels</small>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
            {hostelPieData.length === 0 ? (
              <div style={{ color: '#888', fontSize: 13 }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={hostelPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    innerRadius={18}
                    paddingAngle={2}
                    label={false}
                  >
                    {hostelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="info-card" style={{ padding: 12, minHeight: 140 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ margin: 0, fontSize: 13 }}>New Students (14d)</h4>
            <small style={{ color: 'var(--muted)' }}>{timelineData.reduce((s, d) => s + d.count, 0)} total</small>
          </div>

          <div style={{ minHeight: 100 }}>
            {timelineData.every((d) => d.count === 0) ? (
              <div style={{ color: '#888', fontSize: 13 }}>No recent registrations</div>
            ) : (
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={timelineData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} hide={true} />
                  <Tooltip wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke={COLORS[1]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Table area */}
      <div className="info-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14 }}>Students Table</h3>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>{students.length} students</div>
        </div>

        <div className="data-table-container">
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roll</th>
                <th>Dept</th>
                <th>Hostel</th>
                <th style={{ minWidth: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>
                    <a href={`mailto:${s.email}`} style={{ color: 'var(--accent-600)' }}>
                      {s.email}
                    </a>
                  </td>
                  <td>{s.rollNo}</td>
                  <td>{s.department}</td>
                  <td>{s.hostel || "-"}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                    
<button className="btn-outline" onClick={() => printStudentProfile(s)}>
  Print
</button>

                      <button
                        className="btn-primary"
                        onClick={() => handleEdit(s)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 18, textAlign: 'center', color: 'var(--muted)' }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
