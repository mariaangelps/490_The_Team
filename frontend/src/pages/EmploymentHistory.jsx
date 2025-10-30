import React, { useEffect, useMemo, useState } from "react";
import "./employment.css";

function fmtRange(s, e, current) {
  const pretty = (v) => (v ? v : "");
  return current ? `${pretty(s)} – Present` : `${pretty(s)} – ${pretty(e || "")}`;
}

// ---- API helpers ----
async function apiList() {
  const res = await fetch("/api/employment/list", { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return Array.isArray(data.entries) ? data.entries : [];
}

async function apiUpdate(id, payload) {
  const res = await fetch(`/api/employment/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.entry;
}

// ✅ NEW: DELETE helper
async function apiDelete(id) {
  const res = await fetch(`/api/employment/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data?.error?.message || "Failed to delete.";
  return data;
}

export default function EmploymentHistory() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setItems(await apiList());
      } catch (e) {
        setErr("Failed to load employment history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...items];
    const weight = (it) => (it.current ? "9999-12-31" : (it.endDate || "0000-00-00"));
    arr.sort((a, b) => {
      const byEnd = weight(b).localeCompare(weight(a));
      if (byEnd !== 0) return byEnd;
      return (b.startDate || "").localeCompare(a.startDate || "");
    });
    return arr;
  }, [items]);

  const onSave = async (id, values) => {
    const updated = await apiUpdate(id, values);
    setItems((prev) => prev.map((x) => (x._id === id ? updated : x)));
    setEditingId(null);
  };

  // ✅ UC-025: delete handler
  const onDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    // Optimistic update
    const prev = items;
    setItems(items.filter((x) => x._id !== id));

    try {
      const res = await apiDelete(id);
      alert("Employment entry deleted successfully ✅");
    } catch (e) {
      // revert optimistic update
      setItems(prev);
      alert(e);
    }
  };

  if (loading) return <div className="emp-wrap">Loading…</div>;
  if (err) return <div className="emp-wrap">{err}</div>;

  return (
    <div className="emp-wrap">
      <h2>Employment History</h2>
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
            <ViewCard
              key={it._id}
              item={it}
              onEdit={() => setEditingId(it._id)}
              // ✅ pass delete handler
              onDelete={() => onDelete(it._id)}
              canDelete={items.length > 1} // ✅ only show delete if >1 items
            />
          )
        )}
      </div>
    </div>
  );
}

function ViewCard({ item, onEdit, onDelete, canDelete }) {
  return (
    <div className="emp-item">
      <span className="emp-dot" />
      <div className="row">
        <div>
          <div style={{ fontWeight: 600 }}>
            {item.title} @ {item.company}
            {item.current && <span className="badge badge-current">Current</span>}
          </div>
          <div className="emp-meta">
            {fmtRange(item.startDate, item.endDate, item.current)}
            {item.location ? ` · ${item.location}` : ""}
          </div>
          {item.description && (
            <div style={{ marginTop: 6 }}>{item.description}</div>
          )}
        </div>
        <div className="actions">
          <button onClick={onEdit}>Edit</button>

          {/* ✅ UC-025 DELETE BUTTON */}
          {canDelete && (
            <button onClick={onDelete} className="delete-btn">
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
