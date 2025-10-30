import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./skillsBoard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CATEGORIES = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

function SortableItem({ skill }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: skill._id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="skillsBoard-item" {...attributes} {...listeners}>
      <div className="sb-item-top">
        <span className="sb-item-name">{skill.name}</span>
        <span className="level-tag">{skill.proficiency}</span>
      </div>
    </div>
  );
}

function Column({ category, children, count }) {
  // Permite soltar en el “hueco” de la columna, no solo sobre ítems
  const { setNodeRef } = useDroppable({
    id: `drop-${category}`,
    data: { category },
  });

  const color = {
    Technical: "#7C2ADF",
    "Soft Skills": "#FCBD16",
    Languages: "#1E90FF",
    "Industry-Specific": "#D24BB9",
  }[category];

  return (
    <div className="skillsBoard-column">
      <div className="sb-col-header" style={{ borderColor: color }}>
        <div className="sb-col-title">
          <span className="sb-col-dot" style={{ background: color }} />
          {category}
        </div>
        <div className="sb-col-count">{count}</div>
      </div>
      <div ref={setNodeRef}>{children}</div>
    </div>
  );
}

export default function SkillsBoard() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_URL}/api/skills`, { credentials: "include" });
      const data = await res.json();
      const withOrder = (data.skills || []).map((s, i) => ({ order: i, ...s }));
      setSkills(withOrder);
    })();
  }, []);

  const byCategory = useMemo(() => {
    const map = Object.fromEntries(CATEGORIES.map((c) => [c, []]));
    for (const s of skills) {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    }
    for (const c of CATEGORIES) {
      map[c] = map[c]
        .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return map;
  }, [skills, search]);

  function download(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  function exportJSON() {
    const grouped = Object.fromEntries(CATEGORIES.map((c) => [c, byCategory[c] || []]));
    const blob = new Blob([JSON.stringify(grouped, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    download(url, "skills-by-category.json");
    URL.revokeObjectURL(url);
  }

  function onDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id;
    const overId = over.id;

    const dragged = skills.find((s) => s._id === draggedId);
    if (!dragged) return;

    // ¿Soltaste sobre un ítem o sobre el hueco de una columna?
    const overSkill = skills.find((s) => s._id === overId);
    const destCategory = overSkill ? overSkill.category : over.data?.current?.category;

    if (!destCategory) return;

    if (destCategory === dragged.category) {
      // Reordenar dentro de misma categoría
      const list = skills
        .filter((s) => s.category === dragged.category)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const fromIndex = list.findIndex((s) => s._id === draggedId);
      const toIndex = overSkill ? list.findIndex((s) => s._id === overSkill._id) : list.length - 1;

      const reordered = arrayMove(list, fromIndex, toIndex);
      reordered.forEach((s, i) => (s.order = i));

      setSkills((prev) =>
        prev.map((s) => (s.category === dragged.category ? reordered.find((x) => x._id === s._id) || s : s))
      );
    } else {
      // Mover entre categorías
      const fromCategory = dragged.category;
      const fromList = skills
        .filter((s) => s.category === fromCategory)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const toList = skills
        .filter((s) => s.category === destCategory)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const fromIndex = fromList.findIndex((s) => s._id === draggedId);
      const insertIndex = overSkill ? toList.findIndex((s) => s._id === overSkill._id) : toList.length;

      const [moved] = fromList.splice(fromIndex, 1);
      toList.splice(insertIndex, 0, { ...moved, category: destCategory });

      fromList.forEach((s, i) => (s.order = i));
      toList.forEach((s, i) => (s.order = i));

      const updated = skills.map((s) => {
        if (s._id === moved._id) {
          return toList.find((x) => x._id === s._id) || s;
        }
        if (s.category === fromCategory) {
          return fromList.find((x) => x._id === s._id) || s;
        }
        if (s.category === destCategory) {
          return toList.find((x) => x._id === s._id) || s;
        }
        return s;
      });
      setSkills(updated);

      // Persistir cambio de categoría (sin bloquear UI)
      fetch(`${API_URL}/api/skills/${dragged._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: destCategory }),
      }).catch(() => {});
    }
  }

  return (
    <div className="skillsBoard-container">
      <div className="skills-header">
        <h1 className="skillsBoard-title">My Skills Board</h1>
        <div className="sb-actions">
          <Link to="/skills" className="btn">Back to Simple View</Link>
          <button onClick={exportJSON} className="btn btn-primary">Export JSON</button>
        </div>
      </div>

      <input
        type="text"
        className="skillsBoard-search"
        placeholder="Search skills…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="skillsBoard-columns">
          {CATEGORIES.map((cat) => {
            const list = byCategory[cat] || [];
            return (
              <Column key={cat} category={cat} count={list.length}>
                <SortableContext items={list.map((s) => s._id)} strategy={verticalListSortingStrategy}>
                  {list.map((s) => (
                    <SortableItem key={s._id} skill={s} />
                  ))}
                </SortableContext>
              </Column>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
