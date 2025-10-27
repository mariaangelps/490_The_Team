import { useState } from "react";
import { post } from "../api";
import { Link } from "react-router-dom";

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

function LinkedInButton() {
  return (
    <a
      href={`${API_URL}/api/auth/linkedin`}
      style={{
        display: "inline-block",
        marginTop: 8,
        textAlign: "center",
        background: "#0A66C2", // LinkedIn blue
        color: "white",
        padding: "8px 12px",
        borderRadius: 4,
        textDecoration: "none",
      }}
      rel="noopener noreferrer"
    >
      Continue with LinkedIn
    </a>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await post('/api/auth/login', { email, password });
      window.location.href = '/dashboard';
    } catch (err) {
      if (err.code === 'OAUTH_ONLY') {
        setError('This account uses Google Sign-In. Click “Continue with Google” or set a password.');
      } else {
        setError('Invalid email or password');
      }
    }
  };

  return (
    <div style={{ padding: 12, maxWidth: 420 }}>
      <h2>Log in</h2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <form onSubmit={submit} style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button>Log in</button>
      </form>
      <p style={{ marginTop: 8 }}>
        <Link to="/forgot">Forgot password?</Link>
      </p>
      
      {/* social auth */}
      <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
        <div style={{ textAlign: "center", color: "#666" }}>or</div>
        <GoogleButton />
        <LinkedInButton />
      </div>
    </div>
  );
}
