import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "./profile.jsx";
import Certifications from "./Certifications.jsx";
import Education from "./Education.jsx";
import Portfolio from "./Portfolio.jsx";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const navigate = useNavigate();

  // Fetch current user session
  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (!user) return <p>Not logged in</p>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>Welcome, {user.name || "User"} 👋</h2>
        <button onClick={logout}>Logout</button>
      </header>

      {/* Profile Section */}
      <section style={{ marginBottom: 32 }}>
        <h3>Profile Picture</h3>
        <Profile userId={user.id} />
      </section>

      {/* Education Section */}
      <section style={{ marginBottom: 32 }}>
        <h3>Education</h3>
        <Education userId={user.id} />
      </section>

      {/* Certifications Section */}
      <section style={{ marginBottom: 32 }}>
        <h3>Certifications</h3>
        <Certifications userId={user.id} />
      </section>

      {/* Portfolio Section */}
      <section style={{ marginBottom: 32 }}>
        <h3>Portfolio</h3>
        <Portfolio userId={user.id} />
      </section>
    </div>
  );
}
