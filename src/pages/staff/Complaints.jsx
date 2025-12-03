// src/pages/staff/StaffComplaints.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import {
  Plus, Trash2, Paperclip, CheckCircle, Clock, AlertCircle,
  ImageIcon, X, Search, Eye, Loader2
} from "lucide-react";

const CATEGORIES = ["all", "student", "misplace", "damage", "lost", "food", "delivery", "other"];
const STATUS = ["all", "pending", "in progress", "resolved"];
const SEVERITIES = ["all", "low", "medium", "high", "critical"];

function StatusBadge({ status }) {
  const s = (status || "pending").toLowerCase();
  if (s === "resolved") return <span className="badge badge-green"><CheckCircle size={14} /> Resolved</span>;
  if (s === "in progress" || s === "progress") return <span className="badge badge-yellow"><Clock size={14} /> In progress</span>;
  return <span className="badge badge-red"><AlertCircle size={14} /> Pending</span>;
}

function severityLabel(s) {
  if (!s) return "MED";
  return s.toUpperCase().slice(0, 4);
}

export default function StaffComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [studentRoll, setStudentRoll] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [q, setQ] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;
  const [toasts, setToasts] = useState([]);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // fetch list
  useEffect(() => {
    let mounted = true;
    setLoadingList(true);
    api.get("/api/staff/complaints")
      .then(res => {
        if (!mounted) return;
        setComplaints(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        pushToast({ type: "error", text: "Failed to fetch complaints" });
        console.warn(err);
      })
      .finally(() => mounted && setLoadingList(false));
    return () => { mounted = false; };
  }, []);

  // cleanup temp preview URLs
  useEffect(() => {
    return () => previews.forEach(p => p.url && URL.revokeObjectURL(p.url));
  }, [previews]);

  function pushToast(t) {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), t.duration || 3500);
  }

  // local-only previews before upload
  function onFilesChange(e) {
    const incoming = Array.from(e.target.files || []).slice(0, 5);
    setFiles(incoming);

    const p = incoming.map((f, i) => ({
      id: `${Date.now()}_${i}`,
      name: f.name,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      type: f.type,
      size: f.size
    }));
    previews.forEach(old => old.url && URL.revokeObjectURL(old.url));
    setPreviews(p);
  }

  function removeFile(i) {
    const nextF = files.slice();
    nextF.splice(i, 1);
    const nextP = previews.slice();
    if (nextP[i]?.url) URL.revokeObjectURL(nextP[i].url);
    nextP.splice(i, 1);
    setFiles(nextF);
    setPreviews(nextP);
    if (fileRef.current) fileRef.current.value = null;
  }

  async function submitComplaint(e) {
    e?.preventDefault();
    setSubmitting(true);
    if (!title.trim()) { pushToast({ type: "error", text: "Please provide a title" }); setSubmitting(false); return; }
    if (!description.trim()) { pushToast({ type: "error", text: "Please provide a description" }); setSubmitting(false); return; }

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("category", category);
    fd.append("description", description.trim());
    if (studentRoll.trim()) fd.append("studentRoll", studentRoll.trim());
    fd.append("severity", severity);
    // using field name "attachments" — server uses multer.any(), so field name isn't strictly required
    files.forEach(f => fd.append("attachments", f, f.name));

    try {
      const res = await api.post("/api/staff/complaints", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const created = res?.data && typeof res.data === "object" ? res.data : null;
      pushToast({ type: "success", text: "Complaint created" });

      // reset form
      setTitle(""); setCategory("food"); setDescription(""); setStudentRoll(""); setSeverity("medium");
      previews.forEach(p => p.url && URL.revokeObjectURL(p.url)); setPreviews([]); setFiles([]);
      if (fileRef.current) fileRef.current.value = null;
      setModalOpen(false);

      // append new item with real GCS URLs (created should include documents[].gcsPath and server-generated urls)
      if (created && created._id) setComplaints(prev => [created, ...prev]);
      else {
        const list = await api.get("/api/staff/complaints");
        setComplaints(Array.isArray(list.data) ? list.data : []);
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", text: err?.response?.data?.message || "Failed to create" });
    } finally {
      setSubmitting(false);
    }
  }

  async function resolveComplaint(id) {
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: "resolved" } : c));
    pushToast({ type: "info", text: "Marking as resolved..." });
    try {
      await api.post(`/api/staff/complaints/${id}/resolve`);
      pushToast({ type: "success", text: "Marked resolved" });
    } catch {
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: "pending" } : c));
      pushToast({ type: "error", text: "Failed to mark resolved" });
    }
  }

  // fetch single complaint (fresh signed urls) before showing view modal
  async function fetchComplaintById(id) {
    setViewLoading(true);
    try {
      const res = await api.get(`/api/staff/complaints/${id}`);
      const item = res?.data || null;
      setViewComplaint(item);
    } catch (err) {
      console.error('Failed to fetch complaint', err);
      pushToast({ type: 'error', text: 'Failed to load complaint details' });
    } finally {
      setViewLoading(false);
    }
  }

  // open view modal (fetches fresh urls)
  async function openViewModal(id) {
    setViewComplaint(null);
    await fetchComplaintById(id);
  }

  // image error fallback
  function onImageError(e) {
    // remove broken src and replace with a tiny transparent gif or leave alt placeholder
    e.currentTarget.onerror = null;
    e.currentTarget.style.display = "none";
    const wrapper = e.currentTarget.parentElement;
    if (wrapper) {
      const placeholder = document.createElement('div');
      placeholder.className = 'thumb-placeholder';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.width = '100%';
      placeholder.style.height = '100%';
      placeholder.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
      wrapper.appendChild(placeholder);
    }
  }

  // filtering
  const filtered = complaints.filter(c => {
    const qLower = q.trim().toLowerCase();
    if (filterCategory !== "all" && (c.category || "").toLowerCase() !== filterCategory) return false;
    if (filterStatus !== "all" && (c.status || "pending").toLowerCase() !== filterStatus) return false;
    if (filterSeverity !== "all" && (c.severity || "medium").toLowerCase() !== filterSeverity) return false;
    if (qLower) {
      const inTitle = (c.title || "").toLowerCase().includes(qLower);
      const inDesc = (c.description || "").toLowerCase().includes(qLower);
      const inRoll = (c.studentRoll || "").toLowerCase().includes(qLower);
      if (!(inTitle || inDesc || inRoll)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = filtered.slice((pageSafe - 1) * PER_PAGE, pageSafe * PER_PAGE);

  return (
    <div className="container staff-page enhanced">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Complaints</h1>
          <p className="muted">Polish-level UI — create, filter and resolve complaints quickly.</p>
        </div>
        <div className="header-controls">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input className="search-input"
              placeholder="Search title, roll or description..."
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }} />
          </div>
          <button className="btn btn-ghost" onClick={() => setModalOpen(true)}><Plus size={16} /> New</button>
        </div>
      </div>

      {/* Filters */}
      <div className="controls-row">
        <div className="filters">
          <div className="filter-item">
            <label>Category</label>
            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All" : c[0].toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>Status</label>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              {STATUS.map(s => <option key={s} value={s}>{s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>Severity</label>
            <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setPage(1); }}>
              {SEVERITIES.map(s => <option key={s} value={s}>{s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="summary">
          <div className="summary-pill"><Eye size={14} /> {filtered.length} shown</div>
          <div className="summary-pill muted">Total: {complaints.length}</div>
        </div>
      </div>

      {/* List */}
      <div className="list-area card">
        {loadingList ? (
          <div className="list-loading"><Loader2 className="rot" size={20} /> Loading complaints...</div>
        ) : (
          <>
            <div className="list-grid">
              {paged.map(c => (
                <article className="complaint-card" key={c._id || c.id || Math.random()}>
                  <div className="card-left">
                    <div className="thumb-mini">
                      {c.documents?.length > 0 && c.documents[0]?.url ? (
                        <img src={c.documents[0].url} alt={c.title} onError={onImageError} />
                      ) : <ImageIcon size={20} />}
                    </div>
                  </div>

                  <div className="card-mid">
                    <div className="card-title">{c.title}</div>
                    <div className="card-meta muted small">
                      {c.category?.toUpperCase()} • {c.studentRoll || "—"} • {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    </div>
                    <div className="card-desc">
                      {c.description?.length > 160 ? c.description.slice(0, 160) + "…" : c.description}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span className={`pill severity ${c.severity || "medium"}`}>{severityLabel(c.severity)}</span>
                      <span style={{ marginLeft: 8 }}><StatusBadge status={c.status} /></span>
                    </div>
                  </div>

                  <div className="card-right">
                    <div className="actions">
                      <button className="icon-btn" title="View details" onClick={() => openViewModal(c._id)}>
                        <Eye size={16} />
                      </button>
                      <button className="icon-btn danger" title="Resolve" onClick={() => resolveComplaint(c._id)}>
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {paged.length === 0 && (
                <div className="empty-state"><AlertCircle size={34} /><div>No complaints match your filters.</div></div>
              )}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="pg" onClick={() => setPage(1)} disabled={pageSafe <= 1}>First</button>
              <button className="pg" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageSafe <= 1}>Prev</button>
              <div className="pg-info">Page {pageSafe} / {totalPages}</div>
              <button className="pg" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={pageSafe >= totalPages}>Next</button>
              <button className="pg" onClick={() => setPage(totalPages)} disabled={pageSafe >= totalPages}>Last</button>
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="modal-root" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
          <div className="modal-card modal-card--soft" role="document">
            <div className="modal-header modal-header--fancy">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Create complaint</h3>
                <p className="modal-sub">Quickly report issues — attach photos for context.</p>
              </div>
              <button className="close-btn close-btn--nice" onClick={() => setModalOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>

            <form onSubmit={submitComplaint} className="modal-body modal-form">
              <div className="form-grid">
                <div className="form-group"><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short title" /></div>
                <div className="form-group"><label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.filter(c => c !== "all").map(c => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
                  </select></div>
                <div className="form-group"><label>Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value)}>
                    {["low", "medium", "high", "critical"].map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                  </select></div>
                <div className="form-group"><label>Related student (optional)</label><input value={studentRoll} onChange={e => setStudentRoll(e.target.value)} placeholder="Roll number" /></div>
              </div>

              <div className="form-group"><label>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} placeholder="Explain what happened..." />
              </div>

              <div className="form-group file-group">
                <label>Attachments</label>
                <div className="file-input-row">
                  <label className="file-input-cta">
                    <Paperclip size={14} /><span>Choose images</span>
                    <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFilesChange} />
                  </label>
                  <div className="file-note">Up to 5 images • JPG/PNG</div>
                </div>

                {previews.length > 0 && (
                  <div className="thumbs small">
                    {previews.map((p, i) => (
                      <div className="thumb-small" key={p.id}>
                        <div className="thumb-img">{p.url ? <img src={p.url} alt={p.name} /> : <ImageIcon size={18} />}</div>
                        <div className="thumb-info">
                          <div className="thumb-name">{p.name}</div>
                          <div className="thumb-actions">
                            <button type="button" className="btn-icon" onClick={() => removeFile(i)} aria-label="Remove"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions modal-actions--right">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 className="rot" size={16} /> : "Create complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewComplaint !== null && (
        <div className="modal-root" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={() => setViewComplaint(null)} />
          <div className="modal-card modal-card--soft" role="document">
            <div className="modal-header modal-header--fancy">
              <div className="modal-title-wrap">
                <h3 className="modal-title">{viewLoading ? 'Loading…' : (viewComplaint?.title || 'Complaint')}</h3>
                <p className="modal-sub">Complaint details & attachments</p>
              </div>
              <button className="close-btn close-btn--nice" onClick={() => setViewComplaint(null)} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="modal-body modal-form">
              {viewLoading ? (
                <div className="center"><Loader2 className="rot" size={20} /> Loading details...</div>
              ) : (
                <>
                  <div className="detail-section"><strong>Category:</strong> {viewComplaint.category || "—"}</div>
                  <div className="detail-section"><strong>Status:</strong> {viewComplaint.status || "pending"}</div>
                  <div className="detail-section"><strong>Severity:</strong> {viewComplaint.severity || "medium"}</div>
                  <div className="detail-section"><strong>Student:</strong> {viewComplaint.studentRoll || "—"}</div>
                  <div className="detail-section"><strong>Created:</strong> {viewComplaint.createdAt ? new Date(viewComplaint.createdAt).toLocaleString() : "—"}</div>

                  <div className="detail-section" style={{ marginTop: 10 }}>
                    <strong>Description:</strong>
                    <p className="muted" style={{ marginTop: 6 }}>{viewComplaint.description || "—"}</p>
                  </div>

                  {viewComplaint.documents?.length > 0 && (
                    <>
                      <strong>Attachments:</strong>
                      <div className="thumbs small" style={{ marginTop: 10 }}>
                        {viewComplaint.documents.map((doc, i) => (
                          <div className="thumb-small" key={i}>
                            <div className="thumb-img">
                              {doc.url ? (
                                <a href={doc.url} target="_blank" rel="noreferrer">
                                  <img src={doc.url} alt={`Attachment ${i + 1}`} onError={onImageError} />
                                </a>
                              ) : <ImageIcon size={18} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="modal-actions modal-actions--right">
                    <button className="btn btn-primary" onClick={() => setViewComplaint(null)}>Close</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toasts" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type || "info"}`}>
            <div className="toast-body">{t.text}</div>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
