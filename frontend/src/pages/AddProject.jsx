// src/pages/AddProject.jsx
import React, { useState } from "react";

export default function AddProject({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tech, setTech] = useState("");
  const [industry, setIndustry] = useState("");
  const [date, setDate] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const newProject = {
      id: Date.now(), // temporary unique ID
      title,
      description,
      tech: tech.split(",").map((t) => t.trim()),
      industry,
      date,
      thumbnail,
    };
    onAdd(newProject);

    // Clear form
    setTitle(""); setDescription(""); setTech(""); setIndustry(""); setDate(""); setThumbnail("");
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 400 }}>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input placeholder="Thumbnail URL" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
      <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <input placeholder="Tech (comma separated)" value={tech} onChange={(e) => setTech(e.target.value)} />
      <input placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <button type="submit">Add Project</button>
    </form>
  );
}
