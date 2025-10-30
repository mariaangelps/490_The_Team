import React, { useState } from "react";
import { Link } from "react-router-dom";
import"./employment.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function InlineError({ children }) {
  if (!children) return null;
  return <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{children}</p>;
}

export default function EmploymentAddForm({ initial, onCancel, onSuccess }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    company: initial?.company ?? "",
    location: initial?.location ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
    current: initial?.current ?? false,
    description: (initial?.description ?? "").slice(0, 1000),
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const descCount = form.description?.length ?? 0;
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Job title is required";
    if (!form.company.trim()) e.company = "Company is required";
    if (!form.startDate) e.startDate = "Start date is required";

    // si NO es posición actual, endDate es requerido
    if (!form.current && !form.endDate) e.endDate = "End date is required unless Current is checked";

    // orden de fechas
    if (form.startDate && form.endDate && !form.current) {
      const s = new Date(form.startDate).getTime();
      const en = new Date(form.endDate).getTime();
      if (isFinite(s) && isFinite(en) && s > en) e.endDate = "End date must be after start date";
    }

    if (descCount > 1000) e.description = "Max 1000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    if (!validate()) return;

    setBusy(true);
    try {
      const payload = {
        ...form,
        description: (form.description || "").slice(0, 1000),
        endDate: form.current ? null : form.endDate || null,
      };
      const res = await fetch(`${API_URL}/api/employment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { entry } = await res.json();
      setStatus("success");
      onSuccess?.(entry);
      // limpia el formulario
      setForm({
        title: "", company: "", location: "", startDate: "",
        endDate: "", current: false, description: "",
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="page-title">Add Employment Entry</h1>

      {/* ✅ Botones de navegación */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Link to="/employment" className="btn btn-secondary">
          ← Back to Employment History
        </Link>
        <Link to="/profile/basic" className="btn btn-primary">
          Edit Profile Info
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Job title *</label>
          <input value={form.title} onChange={(e) => setField("title", e.target.value)} />
          <InlineError>{errors.title}</InlineError>
        </div>

        <div>
          <label>Company *</label>
          <input value={form.company} onChange={(e) => setField("company", e.target.value)} />
          <InlineError>{errors.company}</InlineError>
        </div>

        <div className="md:col-span-2">
          <label>Location</label>
          <input value={form.location} onChange={(e) => setField("location", e.target.value)} />
        </div>

        <div>
          <label>Start date *</label>
          <input type="date" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} />
          <InlineError>{errors.startDate}</InlineError>
        </div>

        <div>
          <label>End date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
            disabled={form.current}
            placeholder={form.current ? "Present" : "yyyy-mm-dd"}
          />
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              id="current"
              type="checkbox"
              checked={form.current}
              onChange={(e) => setField("current", e.target.checked)}
            />
            <label htmlFor="current">Current position</label>
          </div>
          <InlineError>{errors.endDate}</InlineError>
        </div>

        <div className="md:col-span-2">
          <label>Job description (max 1000)</label>
          <textarea
            rows={4}
            value={form.description}
            maxLength={1000}
            onChange={(e) => setField("description", e.target.value)}
          />
          <div style={{ fontSize: 12, opacity: 0.7 }}>{descCount}/1000</div>
          <InlineError>{errors.description}</InlineError>
        </div>

        <div className="md:col-span-2" style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onCancel} className="btn">Cancel</button>
          {status === "success" && <span style={{ color: "#16a34a" }}>Saved ✔</span>}
          {status === "error" && <span style={{ color: "#dc2626" }}>Could not save. Try again.</span>}
        </div>
      </form>
    </div>
  );
}
