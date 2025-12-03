// src/pages/staff/StaffStock.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios"; // your axios instance
import "./css/staff-stock.css";

import {
  Plus,
  Search as IconSearch,
  RefreshCw,
  Edit2,
  Trash2,
  Loader2,
  Download,
  Clipboard
} from "lucide-react";

// categories same as earlier (id must match server-side category field)
const CATEGORIES = [
  { id: "infrastructure", title: "Hostel Infrastructure & Maintenance" },
  { id: "mess", title: "Mess & Kitchen" },
  { id: "housekeeping", title: "Housekeeping & Sanitation" },
  { id: "amenities", title: "Student Amenities & Common Areas" },
  { id: "medical", title: "Medical & First Aid" },
  { id: "admin", title: "Administrative & Office" },
  { id: "safety", title: "Safety & Emergency" },
  { id: "it", title: "IT / Internet / Communication" },
  { id: "services", title: "External Services (contracts)" }
];

function emptyForm() {
  return { category: CATEGORIES[0].id, name: "", qty: "", unit: "", note: "", reorderLevel: "", supplier: "" };
}

export default function StaffStock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(() => CATEGORIES.map(c => c.id));
  const [query, setQuery] = useState("");

  // form state
  const [form, setForm] = useState(emptyForm());
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState(null); // id currently saving (for edit)
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get("/api/staff/stock");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load stock items", err);
      alert("Failed to load stock items");
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return CATEGORIES.map(cat => ({
      ...cat,
      items: items.filter(it => it.category === cat.id && (q === "" || (it.name || "").toLowerCase().includes(q) || (it.note || "").toLowerCase().includes(q)))
    }));
  }, [items, query]);

  function toggle(id) {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  // add item
  async function handleAdd(e) {
    e.preventDefault();
    // basic validation
    if (!form.name || !form.category) return alert("Name and category required");
    setAdding(true);
    try {
      const payload = {
        category: form.category,
        name: form.name,
        qty: form.qty || null,
        unit: form.unit || null,
        note: form.note || null,
        reorderLevel: form.reorderLevel || null,
        supplier: form.supplier || null
      };
      const res = await api.post("/api/staff/stock", payload);
      if (res?.data) {
        setItems(prev => [res.data, ...prev]);
        setForm(emptyForm());
      }
    } catch (err) {
      console.error("Add error", err);
      alert(err?.response?.data?.message || "Failed to add item");
    } finally {
      setAdding(false);
    }
  }

  // begin edit
  function beginEdit(item) {
    setEditingId(item._id);
    setForm({
      category: item.category,
      name: item.name,
      qty: item.qty || "",
      unit: item.unit || "",
      note: item.note || "",
      reorderLevel: item.reorderLevel || "",
      supplier: item.supplier || ""
    });
    // ensure category expanded
    if (!expanded.includes(item.category)) setExpanded(prev => [...prev, item.category]);
    // scroll to form for clarity
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // save (edit)
  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingId) return;
    setSavingId(editingId);
    try {
      const payload = {
        category: form.category,
        name: form.name,
        qty: form.qty || null,
        unit: form.unit || null,
        note: form.note || null,
        reorderLevel: form.reorderLevel || null,
        supplier: form.supplier || null
      };
      const res = await api.put(`/api/staff/stock/${editingId}`, payload);
      if (res?.data) {
        setItems(prev => prev.map(it => it._id === editingId ? res.data : it));
        setEditingId(null);
        setForm(emptyForm());
      }
    } catch (err) {
      console.error("Save error", err);
      alert(err?.response?.data?.message || "Failed to save");
    } finally {
      setSavingId(null);
    }
  }

  // cancel edit
  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  // delete
  async function handleDelete(id) {
    if (!window.confirm("Delete this item?")) return;
    // optimistic remove
    const before = items;
    setItems(prev => prev.filter(i => i._id !== id));
    try {
      await api.delete(`/api/staff/stock/${id}`);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
      setItems(before); // revert
    }
  }

  // small export CSV util
  function exportCsv() {
    const rows = items.map(i => ({
      category: (CATEGORIES.find(c => c.id === i.category)?.title) || i.category,
      name: i.name,
      qty: i.qty || "",
      unit: i.unit || "",
      note: i.note || "",
      supplier: i.supplier || ""
    }));
    const headers = ["category","name","qty","unit","note","supplier"];
    const esc = v => `"${String(v || "").replace(/"/g,'""')}"`;
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hostel_stock_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // copy JSON
  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(items, null, 2));
      alert("Stock JSON copied to clipboard");
    } catch (e) {
      alert("Clipboard copy failed");
    }
  }

  return (
    <div className="staff-stock-page">
      <header className="ss-header">
        <div>
          <h2>📦 Stock Management</h2>
          <p className="muted">Monitor, add and edit hostel inventory. Changes are saved to the server.</p>
        </div>

        <div className="ss-actions">
          <div className="search">
            <IconSearch size={16} className="search-icon" />
            <input
              aria-label="Search items"
              placeholder="Search items, notes or supplier..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="icon-btn" title="Refresh" onClick={fetchItems}><RefreshCw size={16} /></button>
          </div>

          <div className="top-buttons">
            <button className="btn btn-ghost" onClick={exportCsv}><Download size={16} /> Export CSV</button>
            <button className="btn btn-ghost" onClick={copyJson}><Clipboard size={16} /> Copy JSON</button>
          </div>
        </div>
      </header>

      {/* Add / Edit form */}
      <section className="ss-form-card">
        <form onSubmit={editingId ? handleSaveEdit : handleAdd} className="ss-form-grid">
          <div className="col category-col">
            <label className="label">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="col wide">
            <label className="label">Item name</label>
            <input placeholder="Item name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="col small">
            <label className="label">Qty</label>
            <input placeholder="Qty" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
          </div>

          <div className="col small">
            <label className="label">Unit</label>
            <input placeholder="Unit (kg, L, pcs)" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
          </div>

          <div className="col small">
            <label className="label">Reorder</label>
            <input placeholder="Reorder level" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))} />
          </div>

          <div className="col medium">
            <label className="label">Supplier</label>
            <input placeholder="Supplier" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
          </div>

          <div className="col full">
            <label className="label">Note</label>
            <input placeholder="Small note about this item (storage, shelf life, etc.)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>

          <div className="col actions-col">
            {editingId ? (
              <>
                <button className="btn" type="submit" disabled={savingId === editingId}>{savingId === editingId ? <Loader2 className="rot" size={16} /> : "Save changes"}</button>
                <button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-primary" type="submit" disabled={adding}>{adding ? <Loader2 className="rot" size={16} /> : <><Plus size={14} /> Add item</>}</button>
            )}
          </div>
        </form>
      </section>

      {/* Groups */}
      <main className="ss-groups">
        {loading ? (
          <div className="center"><Loader2 size={28} className="rot" /> Loading inventory…</div>
        ) : (
          grouped.map(group => (
            <section key={group.id} className="ss-group-card">
              <div className="group-head">
                <div>
                  <h3 className="group-title">{group.title}</h3>
                  <div className="muted small">{group.items.length} items</div>
                </div>
                <div className="group-controls">
                  <button className="btn btn-ghost" onClick={() => toggle(group.id)}>{expanded.includes(group.id) ? "Collapse" : "Expand"}</button>
                </div>
              </div>

              {expanded.includes(group.id) && (
                <div className="group-body">
                  {group.items.length === 0 ? (
                    <div className="muted">No items in this category</div>
                  ) : (
                    <div className="table-wrap">
                      <table className="ss-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th style={{ width: 80 }}>Qty</th>
                            <th style={{ width: 90 }}>Unit</th>
                            <th>Note</th>
                            <th style={{ width: 140 }}>Supplier</th>
                            <th style={{ width: 140 }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map(it => (
                            <tr key={it._id}>
                              <td className="item-name">{it.name}</td>
                              <td>{it.qty || "—"}</td>
                              <td>{it.unit || "—"}</td>
                              <td className="item-note">{it.note || "—"}</td>
                              <td>{it.supplier || "—"}</td>
                              <td>
                                <button className="icon-btn" title="Edit" onClick={() => beginEdit(it)}><Edit2 size={14} /></button>
                                <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(it._id)}><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>
          ))
        )}
      </main>

      <footer className="ss-footer muted">
        Tip: use the form above to add or edit items. Use Export CSV for quick reports.
      </footer>
    </div>
  );
}
