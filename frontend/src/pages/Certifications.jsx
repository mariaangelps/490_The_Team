import React, { useState } from "react";

export default function Certifications() {
  const [certs, setCerts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    organization: "",
    dateEarned: "",
    expirationDate: "",
    doesNotExpire: false,
    certNumber: "",
    document: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
      if (name === "doesNotExpire" && checked) setForm({ ...form, expirationDate: "" });
    } else if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCerts([...certs, form]);
    setForm({
      name: "",
      organization: "",
      dateEarned: "",
      expirationDate: "",
      doesNotExpire: false,
      certNumber: "",
      document: null,
    });
  };

  const handleDelete = (index) => {
    setCerts(certs.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>Manage Certifications</h2>
      
      {/* Certification Form */}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          type="text"
          name="name"
          placeholder="Certification Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="organization"
          placeholder="Issuing Organization"
          value={form.organization}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dateEarned"
          placeholder="Date Earned"
          value={form.dateEarned}
          onChange={handleChange}
          required
        />
        {!form.doesNotExpire && (
          <input
            type="date"
            name="expirationDate"
            placeholder="Expiration Date"
            value={form.expirationDate}
            onChange={handleChange}
          />
        )}
        <label>
          <input
            type="checkbox"
            name="doesNotExpire"
            checked={form.doesNotExpire}
            onChange={handleChange}
          /> Does not expire
        </label>
        <input
          type="text"
          name="certNumber"
          placeholder="Certification Number / ID"
          value={form.certNumber}
          onChange={handleChange}
        />
        <input
          type="file"
          name="document"
          onChange={handleChange}
        />
        <button type="submit">Add Certification</button>
      </form>

      {/* Certifications List */}
      <h3 style={{ marginTop: 20 }}>Your Certifications</h3>
      {certs.length === 0 && <p>No certifications added yet.</p>}
      <ul>
        {certs.map((c, i) => (
          <li key={i} style={{ marginBottom: 10 }}>
            <strong>{c.name}</strong> ({c.organization}) – Earned: {c.dateEarned}{" "}
            {c.doesNotExpire ? "(Does not expire)" : `Expires: ${c.expirationDate || "N/A"}`}{" "}
            {c.certNumber && `ID: ${c.certNumber}`}{" "}
            {c.document && <span>📄 {c.document.name}</span>}
            <button onClick={() => handleDelete(i)} style={{ marginLeft: 10 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
