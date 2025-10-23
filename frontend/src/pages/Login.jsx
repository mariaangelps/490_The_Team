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
      <GoogleButton />
    </div>
  );
}
