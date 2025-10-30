import React, { useEffect, useMemo, useRef, useState } from "react";
import { listSkills, createSkill, updateSkill, deleteSkill, suggestSkills } from "../api/skills";

const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
const CATEGORIES = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

export default function SkillsManager() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [proficiency, setProficiency] = useState(PROFICIENCIES[0]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setItems(await listSkills());
      } catch (e) {
        setError("Failed to load skills.");
      }
    })();
  }, []);

  // cerrar dropdown si click afuera
  useEffect(() => {
    const onDoc = (e) => {
      if (!suggestRef.current?.contains(e.target)) setShowSuggest(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // prevención de duplicados en cliente (misma categoría + mismo nombre CI)
  const hasDuplicate = useMemo(() => {
    const n = name.trim().toLowerCase();
    return items.some(s => s.category === category && s.name.trim().toLowerCase() === n);
  }, [name, category, items]);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter a skill name.");
      return;
    }
    if (hasDuplicate) {
      setError("This skill already exists in that category.");
      return;
    }
    setBusy(true);
    try {
      const entry = await createSkill({ name: name.trim(), category, proficiency });
      setItems(prev => [...prev, entry].sort(sorter));
      setName("");
      setProficiency(PROFICIENCIES[0]);
      // mantener categoría seleccionada
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  function sorter(a, b) {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  }

  async function changeProficiency(id, newProf) {
    try {
      const updated = await updateSkill(id, { proficiency: newProf });
      setItems(prev => prev.map(s => (s._id === id ? updated : s)).sort(sorter));
    } catch (e) {
      setError("Failed to update skill.");
    }
  }

  async function remove(id) {
    const ok = confirm("Remove this skill?");
    if (!ok) return;
    try {
      await deleteSkill(id);
      setItems(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      setError("Failed to delete skill.");
    }
  }

  // autocompletar
  useEffect(() => {
    let live = true;
    const q = name.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    suggestSkills(q).then(list => {
      if (live) setSuggestions(list);
    }).catch(() => {});
    return () => { live = false; };
  }, [name]);

  return (
    <div className="skills-wrap" style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Skills</h2>

      <form onSubmit={handleAdd} className="skills-form" style={{
        display: "grid", gap: 8, gridTemplateColumns: "1fr 180px 180px 120px"
      }}>
        <div ref={suggestRef} style={{ position: "relative" }}>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setShowSuggest(true); }}
            onFocus={() => setShowSuggest(true)}
            placeholder="Skill name (e.g., React)"
            className="input"
            style={{ width: "100%", padding: "8px 10px" }}
          />
          {showSuggest && suggestions.length > 0 && (
            <div
              className="suggest-box"
              style={{
                position: "absolute", top: "100%", left: 0, right: 0,
                background: "white", border: "1px solid #ddd", zIndex: 5,
                maxHeight: 200, overflow: "auto"
              }}
            >
              {suggestions.map((s) => (
                <div
                  key={s}
                  onMouseDown={() => { setName(s); setShowSuggest(false); }}
                  style={{ padding: "6px 10px", cursor: "pointer" }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input" style={{ padding: 8 }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={proficiency} onChange={(e) => setProficiency(e.target.value)} className="input" style={{ padding: 8 }}>
          {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <button disabled={busy} className="btn" style={{ padding: "8px 10px" }}>
          {busy ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <div style={{ color: "crimson", marginTop: 8 }}>{String(error)}</div>}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {items.sort(sorter).map(s => (
          <div key={s._id} className="skill-card" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            border: "1px solid #e5e7eb", padding: 10, borderRadius: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className={`badge badge-${s.category.replace(/\s+/g, "").toLowerCase()}`} style={{
                fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd"
              }}>
                {s.category}
              </span>
              <strong>{s.name}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* editable proficiency */}
              <select
                value={s.proficiency}
                onChange={(e) => changeProficiency(s._id, e.target.value)}
                style={{ padding: 6 }}
                title="Edit proficiency"
              >
                {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <button onClick={() => remove(s._id)} className="btn danger" style={{ padding: "6px 10px" }}>
                Remove
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ color: "#6b7280", fontStyle: "italic" }}>No skills yet. Add your first one above.</div>
        )}
      </div>
    </div>
  );
}
