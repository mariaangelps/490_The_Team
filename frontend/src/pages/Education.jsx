import { useEffect, useMemo, useState } from "react";

// ✅ usa VITE_API_URL si existe; si no, cae a localhost:4000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** =============== API helpers inline =============== */
async function eduList() {
  const res = await fetch(`${API_URL}/api/education/list`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.entries) ? data.entries : [];
}
async function eduCreate(payload) {
  const res = await fetch(`${API_URL}/api/education`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json();
}
async function eduUpdate(id, payload) {
  const res = await fetch(`${API_URL}/api/education/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json();
}
async function eduDelete(id) {
  const res = await fetch(`${API_URL}/api/education/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json();
}
/** ================================================== */

const LEVELS = [
  "High School",
  "Associate",
  "Bachelor's",
  "Master's",
  "PhD",
  "Professional",
  "Certificate",
  "Diploma",
];

function Empty() {
  return (
    <div className="p-6 border rounded-xl shadow-sm">
      <p>No education entries yet. Click <strong>Add Education</strong> to create one.</p>
    </div>
  );
}

function Row({ item, onEdit, onDelete }) {
  const range = item.currentlyEnrolled
    ? `${item.startDate || ""} – Present`
    : `${item.startDate || ""} – ${item.graduationDate || ""}`;

  return (
    <div className="flex items-start justify-between gap-4 p-4 border rounded-xl mb-3">
      <div>
        <div className="font-semibold">
          {item.degreeType} in {item.fieldOfStudy}
        </div>
        <div className="opacity-80">{item.institution}</div>
        <div className="text-sm opacity-70">{range}</div>
        {item.honors && <div className="text-sm mt-1">🏅 {item.honors}</div>}
        {item.gpa != null && item.gpa !== "" && !item.gpaPrivate && (
          <div className="text-sm mt-1">GPA: {Number(item.gpa).toFixed(2)}</div>
        )}
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={() => onEdit(item)}>Edit</button>
        <button className="btn btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
      </div>
    </div>
  );
}

export default function EducationPage() {
  const emptyForm = {
    institution: "",
    degreeType: "",
    fieldOfStudy: "",
    level: "Bachelor's",
    startDate: "",
    graduationDate: "",
    currentlyEnrolled: false,
    gpa: "",
    gpaPrivate: false,
    honors: "",
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    (async () => {
      try {
        const list = await eduList();
        setItems(list);
      } catch (e) {
        setError("Failed to load education list");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const Aend = a.currentlyEnrolled ? "9999-12" : (a.graduationDate || "0000-00");
      const Bend = b.currentlyEnrolled ? "9999-12" : (b.graduationDate || "0000-00");
      if (Aend !== Bend) return Bend.localeCompare(Aend);
      const Astart = a.startDate || "0000-00";
      const Bstart = b.startDate || "0000-00";
      return Bstart.localeCompare(Astart);
    });
    return copy;
  }, [items]);

  function validate(f) {
    const errs = [];
    if (!f.institution.trim()) errs.push("Institution is required");
    if (!f.degreeType.trim()) errs.push("Degree type is required");
    if (!f.fieldOfStudy.trim()) errs.push("Field of study is required");
    if (!f.level.trim()) errs.push("Level is required");
    if (!f.currentlyEnrolled && !f.graduationDate.trim())
      errs.push("Graduation date is required when not currently enrolled");
    if (f.gpa !== "" && (isNaN(Number(f.gpa)) || Number(f.gpa) < 0 || Number(f.gpa) > 5))
      errs.push("GPA must be between 0 and 5");
    return errs;
  }

  async function onSave() {
    const errs = validate(form);
    if (errs.length) {
      alert(errs.join("\n"));
      return;
    }
    const payload = {
      ...form,
      gpa: form.gpa === "" ? null : Number(form.gpa),
    };
    try {
      if (editingId) {
        await eduUpdate(editingId, payload);
      } else {
        await eduCreate(payload);
      }
      const list = await eduList();
      setItems(list);
      onCancel();
    } catch (e) {
      alert("Save failed");
    }
  }

  function onCancel() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      institution: item.institution,
      degreeType: item.degreeType,
      fieldOfStudy: item.fieldOfStudy,
      level: item.level,
      startDate: item.startDate || "",
      graduationDate: item.graduationDate || "",
      currentlyEnrolled: !!item.currentlyEnrolled,
      gpa: item.gpa == null ? "" : String(item.gpa),
      gpaPrivate: !!item.gpaPrivate,
      honors: item.honors || "",
    });
  }

  async function onDelete(id) {
    if (!confirm("Delete this education entry?")) return;
    try {
      await eduDelete(id);
      setItems(prev => prev.filter(x => x.id !== id));
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Education</h1>
        {!editingId && (
          <button className="btn" onClick={() => setEditingId("new")}>Add Education</button>
        )}
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && sorted.length === 0 && <Empty />}

      {!loading && sorted.length > 0 && (
        <div>
          {sorted.map((it) => (
            <Row key={it.id} item={it} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}

      {editingId && (
        <div className="p-4 border rounded-xl space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span>Institution*</span>
              <input
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span>Level*</span>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span>Degree Type* (e.g., B.S., M.S.)</span>
              <input
                value={form.degreeType}
                onChange={(e) => setForm({ ...form, degreeType: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span>Field of Study*</span>
              <input
                value={form.fieldOfStudy}
                onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span>Start Date (YYYY or YYYY-MM)</span>
              <input
                placeholder="2021-09"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span>Graduation Date {form.currentlyEnrolled ? "(disabled while enrolled)" : "(YYYY or YYYY-MM)"}</span>
              <input
                placeholder="2025-05"
                disabled={form.currentlyEnrolled}
                value={form.graduationDate}
                onChange={(e) => setForm({ ...form, graduationDate: e.target.value })}
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.currentlyEnrolled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currentlyEnrolled: e.target.checked,
                    graduationDate: e.target.checked ? "" : form.graduationDate,
                  })
                }
              />
              <span>Currently enrolled</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span>GPA (optional, 0–5)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  value={form.gpa}
                  onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                />
              </label>

              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={form.gpaPrivate}
                  onChange={(e) => setForm({ ...form, gpaPrivate: e.target.checked })}
                />
                <span>Hide GPA on profile</span>
              </label>
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span>Achievements / Honors</span>
            <textarea
              rows={3}
              value={form.honors}
              onChange={(e) => setForm({ ...form, honors: e.target.value })}
            />
          </label>

          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={onSave}>Save</button>
            <button className="btn" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
