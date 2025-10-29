// src/pages/Portfolio.jsx
import React, { useState } from "react";
import AddProject from "./AddProject.jsx";

export default function Portfolio() {
  const [projects, setProjects] = useState([]);

  const addProject = (project) => {
    setProjects((prev) => [project, ...prev]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Portfolio</h2>

      <AddProject onAdd={addProject} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: 20,
        marginTop: 20
      }}>
        {projects.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
            {p.thumbnail && <img src={p.thumbnail} alt={p.title} style={{ width: "100%", borderRadius: 6 }} />}
            <h3>{p.title}</h3>
            <p>{p.tech?.join(", ")}</p>
            <p>{p.industry}</p>
            <p>{new Date(p.date).toLocaleDateString()}</p>
            <p>{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
