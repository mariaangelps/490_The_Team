import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/profile.jsx";
import DashboardIcon from "./pages/dashboardicon.jsx"; // matches your file
import Portfolio from "./pages/Portfolio.jsx";
import ProfileDashboard from "./pages/ProfileDashboard.jsx";
import Certifications from "./pages/Certifications.jsx";




const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Nav({ user }) {
  return (
    <nav style={{ display: "flex", gap: 12, padding: 12 }}>
      <Link to="/">Home</Link>
      {user ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/icons">Icons</Link>
          <Link to="/certifications">Certifications</Link>

        </>
      ) : (
        <>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </>
      )}
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from backend session
  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Nav user={user} />
      <Routes>
        <Route path="/certifications" element={user ? <Certifications /> : <Navigate to="/login" />}/>
        <Route path="/profile-dashboard" element={user ? <ProfileDashboard /> : <Navigate to="/login" />} />
        <Route path="/portfolio" element={user ? <Portfolio /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard-icons" element={<DashboardIcon />} />
        <Route
          path="/profile"
          element={user ? <Profile userId={user.id} /> : <Navigate to="/login" />}
        />
        <Route
          path="/icons"
          element={user ? <DashboardIcon /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
