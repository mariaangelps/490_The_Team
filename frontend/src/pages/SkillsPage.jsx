import { useEffect, useMemo, useState } from "react";
import { COMMON_SKILLS } from "../data/commonSkills";
import "./skills.css"; // 👈 estilos de abajo

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
const CATEGORIES = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

/* =========================
   Utility/Badge components
   ========================= */
function Badge({ children, className = "" }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

function Confirm({ open, title, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-card">
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-text">{text}</p>
        <div className="confirm-actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Skill Form (with autocomplete)
   ========================= */
function SkillForm({ existing, onAdd }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Technical");
  const [proficiency, setProficiency] = useState("Beginner");
  const [error, setError] = useState("");

  const existingSet = useMemo(
    () => new Set(existing.map(s => s.name.trim().toLowerCase())),
    [existing]
  );

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return COMMON_SKILLS.slice(0, 8);
    return COMMON_SKILLS.filter(s => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [name]);

  async function submit(e) {
    e.preventDefault();
    setError("");

    const normalized = name.trim().toLowerCase();
    if (!normalized) {
      setError("Please enter a skill name.");
      return;
    }
    if (existingSet.has(normalized)) {
      setError("That skill is already added.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/skills`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, proficiency }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || `Error ${res.status}`);
        return;
      }
      onAdd(data.skill);
      setName("");
    } catch {
      setError("Network error.");
    }
  }

  return (
    <form onSubmit={submit} className="skill-form">
      <div className="skill-form-row">
        <div className="skill-form-col">
          <label className="label">Skill name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="skill-input"
            list="skill-suggestions"
            placeholder="e.g., React"
          />
          <datalist id="skill-suggestions">
            {suggestions.map((s, i) => (
              <option key={i} value={s.name} />
            ))}
          </datalist>
        </div>

        <div className="skill-form-col">
          <label className="label">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="skill-select"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="skill-form-col">
          <label className="label">Proficiency</label>
          <select
            value={proficiency}
            onChange={e => setProficiency(e.target.value)}
            className="skill-select"
          >
            {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="skill-form-col end">
          <button className="btn btn-primary">Add</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
    </form>
  );
}

/* =========================
   Skill Row (edit & remove)
   ========================= */
function SkillRow({ skill, onChange, onDelete }) {
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function updateProficiency(p) {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/skills/${skill._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proficiency: p }),
      });
      const data = await res.json();
      if (res.ok) onChange(data.skill);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="skill-row">
      <div className="skill-row-left">
        <Badge>{skill.category}</Badge>
        <span className="skill-name">{skill.name}</span>
      </div>

      <div className="skill-row-actions">
        <select
          disabled={saving}
          value={skill.proficiency}
          onChange={e => updateProficiency(e.target.value)}
          className="skill-select"
        >
          {PROFICIENCIES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button
          onClick={() => setConfirmOpen(true)}
          className="btn btn-danger"
        >
          Remove
        </button>

        <Confirm
          open={confirmOpen}
          title="Remove skill?"
          text={`"${skill.name}" will be removed.`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            setConfirmOpen(false);
            await onDelete(skill._id);
          }}
        />
      </div>
    </div>
  );
}

/* =========================
   Skills Page
   ========================= */
export default function SkillsPage() {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/skills`, { credentials: "include" });
        if (res.status === 401) {
          setError("Not logged in (401).");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        setSkills(data.skills || []);
      } catch {
        setError("Failed to load skills.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function addLocal(s) {
    setSkills(prev => [...prev, s].sort(sorter));
  }
  function updateLocal(s) {
    setSkills(prev => prev.map(x => (x._id === s._id ? s : x)).sort(sorter));
  }
  async function deleteLocal(id) {
    try {
      const res = await fetch(`${API_URL}/api/skills/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setSkills(prev => prev.filter(x => x._id !== id));
    } catch { /* no-op */ }
  }

  const sorter = (a, b) =>
    (a.category || "").localeCompare(b.category || "") ||
    (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase());

  const grouped = useMemo(() => {
    const g = {};
    for (const s of skills.slice().sort(sorter)) {
      g[s.category] = g[s.category] || [];
      g[s.category].push(s);
    }
    return g;
  }, [skills]);

  if (loading) return <div className="page-pad">Loading...</div>;
  if (error) return <div className="page-pad error">{error}</div>;

  return (
    <div className="page-pad space-v">
      <h1 className="page-title">Skills</h1>

      <SkillForm existing={skills} onAdd={addLocal} />

      {Object.keys(grouped).length === 0 ? (
        <p className="muted">No skills yet. Add your first one above.</p>
      ) : (
        Object.entries(grouped).map(([cat, list]) => (
          <section key={cat} className="skill-section">
            <h2 className="section-title">{cat}</h2>
            <div className="skill-list">
              {list.map(s => (
                <SkillRow key={s._id} skill={s} onChange={updateLocal} onDelete={deleteLocal} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
