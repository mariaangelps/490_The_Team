import { useEffect, useMemo, useState } from "react";
import { COMMON_SKILLS } from "../data/commonSkills";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
const CATEGORIES = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

/* =========================
   Utility/Badge components
   ========================= */
function Badge({ children, className = "" }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-2xl px-3 py-1 text-sm font-medium border " +
        "bg-[color:var(--bg)] text-[color:var(--text)] border-[color:var(--border)] shadow-sm " +
        className
      }
    >
      {children}
    </span>
  );
}

function Confirm({ open, title, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/40 z-50">
      <div className="w-[min(92vw,420px)] rounded-2xl bg-white p-5">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{text}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg border" onClick={onCancel}>Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-[#7C2ADF] text-white" onClick={onConfirm}>Delete</button>
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

  // simple autocomplete filter
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
      // keep selected category/proficiency
    } catch (err) {
      setError("Network error.");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Skill name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            list="skill-suggestions"
            placeholder="e.g., React"
          />
          <datalist id="skill-suggestions">
            {suggestions.map((s, i) => (
              <option key={i} value={s.name} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Proficiency</label>
          <select
            value={proficiency}
            onChange={e => setProficiency(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="self-end">
          <button className="px-4 py-2 rounded-lg bg-[#7C2ADF] text-white">Add</button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
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
      // else ignore or show toast (brevity)
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between border rounded-xl px-3 py-2">
      <div className="flex items-center gap-2">
        <Badge>{skill.category}</Badge>
        <span className="font-medium">{skill.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <select
          disabled={saving}
          value={skill.proficiency}
          onChange={e => updateProficiency(e.target.value)}
          className="border rounded-lg px-2 py-1"
        >
          {["Beginner", "Intermediate", "Advanced", "Expert"].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button
          onClick={() => setConfirmOpen(true)}
          className="px-3 py-1 rounded-lg border text-red-600 border-red-300"
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
          // if you're getting redirected to login, your session is missing; this prevents a blank screen
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        setSkills(data.skills || []);
      } catch (e) {
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Skills</h1>

      <SkillForm existing={skills} onAdd={addLocal} />

      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-600">No skills yet. Add your first one above.</p>
      ) : (
        Object.entries(grouped).map(([cat, list]) => (
          <section key={cat} className="space-y-2">
            <h2 className="text-lg font-semibold">{cat}</h2>
            <div className="space-y-2">
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
