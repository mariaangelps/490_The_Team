// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../api";

import "../assets/login.css";
import Button from "../reusableButton.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Helper component, defined outside Login()
function GoogleButton() {
  return (
    <a
      href={`${API_URL}/api/auth/google`}
      className="google-login-button"
    >
      Continue with Google
    </a>
  );
}

function LinkedInButton() {
  return (
    <a
      href={`${API_URL}/api/auth/linkedin`}
      className="linkedin-login-button"
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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await post("/api/auth/login", { email, password });
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "OAUTH_ONLY") {
        setError(
          "This account uses Google Sign-In. Click “Continue with Google” or set a password."
        );
      } else {
        setError(err.message || "Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2 className="login-header">Log in</h2>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={submit} className="login-form">
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? "Logging In..." : "Log In"}
        </Button>
      </form>

      {/* Forgot password link */}
      <p style={{ marginTop: 8 }}>
        <Link to="/forgot">Forgot password?</Link>
      </p>

      {/* Social auth / separator */}
      <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
        <div style={{ textAlign: "center", color: "#666" }}>or</div>
        <GoogleButton />
        <LinkedInButton />
      </div>

      {/* Switch to Register */}
      <div className="switch-text" style={{ marginTop: 16 }}>
        Don't have an account?{" "}
        <Link to="/register" className="page-switch-link">
          Register here
        </Link>
      </div>
    </div>
  );
}
