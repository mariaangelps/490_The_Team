// src/pages/EmploymentHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./employment.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ========================
   Helpers de formato
   ======================== */
function fmtRange(s, e, current) {
  const pretty = (v) => (v ? v : "");
  return current ? `${pretty(s)} – Present` : `${pretty(s)} – ${pretty(e || "")}`;
}

/* ========================
   API helpers
   ======================== */
async function apiList() {
  const res = await fetch(`${API_URL}/api/employment/list`, {
    credentials: "include",
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (res.status === 401) {
    // si quieres redirigir, detecta esto en el efecto
    return { _unauth: true, entries: [] };
  }
  if (res.status === 304) return { entries: [] }; // sin body
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { entries: Array.isArray(data.entries) ? data.entries : [] };
}

async function apiCreate(payload) {
  const res = await fetch(`${API_URL}/api/employment`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { entry }
}

async function apiUpdate(id, payload) {
  const res = await fetch(`${API_URL}/api/employment/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { entry }
}

async function apiDelete(id) {
  const res = await fetch(`${API_URL}/api/employment/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ========================
   Página principal
   ======================== */
export default function EmploymentHistory() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiList();
        if (data._unauth) {
          // redirige si no logueada
          nav("/login?next=/employment");
          return;
        }
        setItems(data.entries);
      } catch (e) {
        setErr("Failed to load employment history.");
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const sorted = useMemo(() => {
    const arr = [...items];
    // current primero; luego por endDate desc; luego startDate desc
    const weight = (it) => (it.current ? "9999-12-31" : (it.endDate || "0000-00-00"));
    arr.sort((a, b) => {
      const byEnd = weight(b).localeCompare(weight(a));
      if (byEnd !== 0) return byEnd;
      return (b.startDate || "").localeCompare(a.startDate || "");
    });
    return arr;
  }, [items]);

  const onSave = async (id, values) => {
    const { entry } = await apiUpdate(id, values); // backend devuelve { entry }
    setItems((prev) => prev.map((x) => (x._id === id ? entry : x)));
    setEditingId(null);
  };

  if (loading) return <div className="emp-wrap">Loading…</div>;
  if (err) return <div className="emp-wrap">{err}</div>;

  return (
    <div className="emp-wrap">
      <div className="skills-header">
        <h1 className="page-title">Employment</h1>
        <Link to="/employment/new" className="btn btn-primary">
          Add Employment
        </Link>
        <Link to="/profile/basic" className="btn">Edit Profile</Link>

      </div>

      {sorted.length === 0 ? (
        <p className="muted">No entries yet. Click “Add Employment”.</p>
      ) : (
        <div className="emp-timeline">
          {sorted.map((it) =>
            editingId === it._id ? (
              <EditCard
                key={it._id}
                initial={it}
                onCancel={() => setEditingId(null)}
                onSave={(vals) => onSave(it._id, vals)}
              />
            ) : (
              <ViewCard key={it._id} item={it} onEdit={() => setEditingId(it._id)} />
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ========================
   Tarjeta de vista
   ======================== */
function ViewCard({ item, onEdit }) {
  return (
    <div className="emp-item">
      <span className="emp-dot" />
      <div className="row">
        <div>
          <div style={{ fontWeight: 600 }}>
            {item.title} @ {item.company}{" "}
            {item.current && <span className="badge badge-current">Current</span>}
          </div>
          <div className="emp-meta">
            {fmtRange(item.startDate, item.endDate, item.current)}
            {item.location ? ` · ${item.location}` : ""}
          </div>
          {item.description && <div style={{ marginTop: 6 }}>{item.description}</div>}
        </div>
        <div className="actions">
          <button onClick={onEdit}>Edit</button>
          {/* Si quieres borrar desde la vista:
          <button onClick={() => apiDelete(item._id).then(()=>window.location.reload())}>Delete</button>
          */}
        </div>
      </div>
    </div>
  );
}

/* ========================
   Tarjeta de edición inline
   ======================== */
function EditCard({ initial, onCancel, onSave }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    company: initial.company || "",
    location: initial.location || "",
    startDate: initial.startDate || "",
    endDate: initial.endDate || "",
    current: !!initial.current,
    description: initial.description || "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (form.current) set("endDate", "");
  }, [form.current]);

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      endDate: form.current ? null : (form.endDate || null),
    });
  };

  return (
    <div className="emp-item">
      <span className="emp-dot" />
      <form onSubmit={submit}>
        <div className="form-grid">
          <div>
            <label>Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div>
            <label>Company</label>
            <input value={form.company} onChange={(e) => set("company", e.target.value)} required />
          </div>
          <div>
            <label>Start Date (YYYY-MM or YYYY-MM-DD)</label>
            <input value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
          </div>
          <div>
            <label>End Date</label>
            <input
              value={form.endDate || ""}
              onChange={(e) => set("endDate", e.target.value)}
              disabled={form.current}
              placeholder={form.current ? "Present" : "YYYY-MM or YYYY-MM-DD"}
            />
          </div>
          <div>
            <label>Location</label>
            <input value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div>
            <label>Current Position?</label>
            <select value={form.current ? "yes" : "no"} onChange={(e) => set("current", e.target.value === "yes")}>
              <option value="no">No</option>
              <option value="yes">Yes (Present)</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / span 2" }}>
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
