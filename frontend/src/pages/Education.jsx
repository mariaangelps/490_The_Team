import React, { useState, useEffect } from "react";

export default function Education({ userId }) {
  const [education, setEducation] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({
    degree: "",
    institution: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
    isPrivate: false,
    honors: "",
    ongoing: false,
  });

  // Fetch education entries (mock or backend)
  useEffect(() => {
    // Replace with fetch(`/api/education/${userId}`) when backend is ready
    const mockData = [
      {
        degree: "B.Sc. Computer Science",
        institution: "NJIT",
        field: "Software Engineering",
        startDate: "2019-09-01",
        endDate: "2023-05-15",
        gpa: "3.8",
        isPrivate: false,
        honors: "Magna Cum Laude",
        ongoing: false,
      },
      {
        degree: "M.Sc. AI",
        institution: "NJIT",
        field: "Artificial Intelligence",
        startDate: "2023-09-01",
        endDate: "",
        gpa: "",
        isPrivate: true,
        honors: "",
        ongoing: true,
      },
    ];
    setEducation(mockData);
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const updated = [...education];
      updated[editingIndex] = form;
      setEducation(updated);
      setEditingIndex(null);
    } else {
      setEducation([form, ...education]); // add at top for reverse chronological
    }
    setForm({
      degree: "",
      institution: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      isPrivate: false,
      honors: "",
      ongoing: false,
    });
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setForm(education[index]);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this education entry?")) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>My Education</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          name="degree"
          placeholder="Degree"
          value={form.degree}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="institution"
          placeholder="Institution"
          value={form.institution}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="field"
          placeholder="Field of Study"
          value={form.field}
          onChange={handleChange}
        />
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
        />
        {!form.ongoing && (
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
          />
        )}
        <label>
          <input
            type="checkbox"
            name="ongoing"
            checked={form.ongoing}
            onChange={handleChange}
          /> Ongoing
        </label>
        <input
          type="text"
          name="gpa"
          placeholder="GPA"
          value={form.gpa}
          onChange={handleChange}
        />
        <label>
          <input
            type="checkbox"
            name="isPrivate"
            checked={form.isPrivate}
            onChange={handleChange}
          /> Hide GPA
        </label>
        <input
          type="text"
          name="honors"
          placeholder="Honors / Achievements"
          value={form.honors}
          onChange={handleChange}
        />
        <button type="submit">{editingIndex !== null ? "Update" : "Add"} Education</button>
      </form>

      {/* List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {education.map((edu, i) => (
          <li key={i} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <strong>{edu.degree}</strong> at {edu.institution} ({edu.field})
            <div>
              {edu.startDate} – {edu.ongoing ? "Ongoing" : edu.endDate || "N/A"}
            </div>
            {!edu.isPrivate && edu.gpa && <div>GPA: {edu.gpa}</div>}
            {edu.honors && <div>Honors: {edu.honors}</div>}
            <button onClick={() => handleEdit(i)} style={{ marginRight: 8 }}>Edit</button>
            <button onClick={() => handleDelete(i)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
