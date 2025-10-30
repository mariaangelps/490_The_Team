import React, { useState } from "react";

const ProfileBasicForm = ({ onCancel }) => {
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
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["fullName", "email", "industry", "experience"];
    for (let field of required) {
      if (!formData[field]) {
        setMessage(`❌ ${field} is required`);
        return;
      }
    }

    try {
      const res = await fetch("http://localhost:4000/api/profile/basic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
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
      } else {
        setMessage("⚠️ Error saving profile.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Server connection error.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: 24 }}>
      <h2>Basic Profile Information</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <input
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
          <input
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <input
          name="headline"
          placeholder="Professional Headline (e.g., Frontend Developer)"
          value={formData.headline}
          onChange={handleChange}
        />

        <textarea
          name="bio"
          placeholder="Brief Bio (max 500 characters)"
          maxLength={500}
          value={formData.bio}
          onChange={handleChange}
          rows={4}
        />

        <small>{charCount}/500 characters</small>

        <select name="industry" value={formData.industry} onChange={handleChange} required>
          <option value="">Select Industry</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>

        <select name="experience" value={formData.experience} onChange={handleChange} required>
          <option value="">Select Experience Level</option>
          {experienceLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button type="submit" style={{ backgroundColor: "#fcbd16", padding: "8px 16px" }}>
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ backgroundColor: "#ccc", padding: "8px 16px" }}
          >
            Cancel
          </button>
        </div>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
};

export default ProfileBasicForm;
