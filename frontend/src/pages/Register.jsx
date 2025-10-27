import { useState } from "react";
import { post } from "../api";
import "../register.css";
import Button from "../reusableButton.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function GoogleButton() {
  return (
    <a
      href={`${API_URL}/api/auth/google`}
      className="google-button"
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
    <div className="login-form-container">
      <h2 className="register-header">Create your account</h2>
      {error && <div style={{ color: "crimson", marginTop: 8, textAlign: 'center' }}>{error}</div>}
      <form onSubmit={onSubmit} className="register-form">
        <input 
          className="register-input"
          name="firstName" 
          placeholder="First name" 
          value={form.firstName} 
          onChange={onChange} 
          required 
        />
        <input 
          className="register-input"
          name="lastName" 
          placeholder="Last name" 
          value={form.lastName} 
          onChange={onChange}
        />
        <input 
          className="register-input"
          name="email" 
          type="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={onChange} 
          required 
        />
        <input 
          className="register-input"
          name="password" 
          type="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={onChange} 
          required 
        />
        <input 
          className="register-input"
          name="confirmPassword" 
          type="password" 
          placeholder="Confirm password" 
          value={form.confirmPassword} 
          onChange={onChange} 
          required
        />
        <button 
          className="register-button"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>
        <GoogleButton />
      </div>
      <div className="switch-text">
        Already have an account?{' '}
        <a href="/login" className="page-switch-link">
          Log in here
        </a>
      </div>
    </div>
  );
}
