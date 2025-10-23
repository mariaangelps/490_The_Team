import { useState } from "react";
import { post } from "../api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function GoogleButton() {
  return (
    <a
      href={`${API_URL}/api/auth/google`}
      style={{
        display: "inline-block",
        marginTop: 8,
        textAlign: "center",
        background: "#4285F4",
        color: "white",
        padding: "8px 12px",
        borderRadius: 4,
        textDecoration: "none",
      }}
    >
      Continue with Google
    </a>
  );
}

export default function Register() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await post("/api/auth/register", form);
      window.location.href = "/dashboard"; // UC-001 redirect
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 12, maxWidth: 420 }}>
      <h2>Create your account</h2>
      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <input name="firstName" placeholder="First name" value={form.firstName} onChange={onChange} required />
        <input name="lastName" placeholder="Last name" value={form.lastName} onChange={onChange} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={onChange} required />
        <button disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
      </form>
      <GoogleButton />
    </div>
  );
}
