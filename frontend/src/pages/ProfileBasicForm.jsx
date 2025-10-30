import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./profile.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function InlineError({ children }) {
  if (!children) return null;
  return <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{children}</p>;
}

export default function ProfileBasicForm({ onCancel }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    headline: "",
    bio: "",
    industry: "",
    experience: "",
  });

  const [charCount, setCharCount] = useState(0);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const industries = [
    "Software Development",
    "Engineering",
    "Finance",
    "Education",
    "Healthcare",
    "Other",
  ];

  const experienceLevels = ["Entry", "Mid", "Senior", "Executive"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "bio") setCharCount(value.length);
  };

  function validate() {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Invalid email format";
    if (formData.phone && !/^[0-9+\-() ]+$/.test(formData.phone))
      e.phone = "Invalid phone number";
    if (formData.bio.length > 500) e.bio = "Max 500 characters";
    if (!formData.industry) e.industry = "Select industry";
    if (!formData.experience) e.experience = "Select experience level";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validate()) return;

    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/profile/basic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setMessage("✅ Profile saved successfully!");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        headline: "",
        bio: "",
        industry: "",
        experience: "",
      });
      setCharCount(0);
      setErrors({});
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error saving profile. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Basic Profile Information</h1>
  
      {/* ✅ Navigation buttons */}
      <div className="profile-nav">
        <Link to="/employment" className="btn btn-secondary">
          ← Back to Employment History
        </Link>
  
        <Link to="/employment/new" className="btn btn-primary">
          Add Employment Entry
        </Link>
      </div>
  
      {/* ✅ REAL FORM STARTS HERE (fuera del nav) */}
      <form className="profile-form" onSubmit={handleSubmit}>
        <div>
          <label>Full Name *</label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <InlineError>{errors.fullName}</InlineError>}
        </div>
  
        <div>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <InlineError>{errors.email}</InlineError>}
        </div>
  
        {/* CITY + STATE */}
        <div className="profile-row">
          <div>
            <label>City</label>
            <input name="city" value={formData.city} onChange={handleChange} />
          </div>
  
          <div>
            <label>State</label>
            <input name="state" value={formData.state} onChange={handleChange} />
          </div>
        </div>
  
        {/* HEADLINE */}
        <div>
          <label>Professional Headline</label>
          <input
            name="headline"
            placeholder="e.g., Software Engineer"
            value={formData.headline}
            onChange={handleChange}
          />
        </div>
  
        {/* BIO */}
        <div>
          <label>Bio (max 500 chars)</label>
          <textarea
            name="bio"
            rows={4}
            maxLength={500}
            value={formData.bio}
            onChange={handleChange}
          />
          <div className="bio-counter">{charCount}/500</div>
        </div>
  
        {/* DROPDOWNS */}
        <div className="profile-row">
          <div>
            <label>Industry *</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
            >
              <option value="">Select industry</option>
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
            {errors.industry && <InlineError>{errors.industry}</InlineError>}
          </div>
  
          <div>
            <label>Experience *</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            >
              <option value="">Select experience level</option>
              {experienceLevels.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            {errors.experience && <InlineError>{errors.experience}</InlineError>}
          </div>
        </div>
  
        {/* Buttons */}
        <div className="profile-actions">
          <button type="submit" className="btn-save">Save</button>
          <button type="button" onClick={onCancel} className="btn-cancel">Cancel</button>
        </div>
  
        {message && (
          <p className={message.includes("✅") ? "profile-msg-success" : "profile-msg-error"}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
  
}
