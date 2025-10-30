import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";

import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/profile.jsx";
import DashboardIcon from "./pages/dashboardicon.jsx"; // matches your file
import Portfolio from "./pages/Portfolio.jsx";
import ProfileDashboard from "./pages/ProfileDashboard.jsx";
import Certifications from "./pages/Certifications.jsx";
import Education from "./pages/Education.jsx";


import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import Settings from "./pages/Settings.jsx";
import SkillsPage from "./pages/SkillsPage.jsx";  import "./main.css";
// Páginas
import EmploymentHistory from "./pages/EmploymentHistory.jsx"; // 👈 ruta real del archivo
// Features (están dentro de src/features)
import EmploymentAddForm from "./pages/EmploymentAddForm.jsx";
import ProfileBasicForm from "./pages/ProfileBasicForm.jsx";

import EducationPage from "./pages/Education";

import SkillsBoard from "./pages/SkillsBoard.jsx";
import IconImage from "./assets/THE.png";
import DarkIconImage from "./assets/THE(yellow).png"; // unused currently
import whiteIcon from "./assets/THE(white).png";
import Button from "./reusableButton.jsx";
//comm
export const ThemeContext = createContext();


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Nav() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  
  // Check if user is on a protected/authenticated page
  const isProtectedPage = location.pathname === "/dashboard" || location.pathname === "/settings";
  const isDashboard = location.pathname === "/dashboard";
  const isSettings = location.pathname === "/settings";

  const iconName = theme === "light" ? "dark_mode" : theme === "dark" ? "palette" : theme === "fun" ? "visibility" : "light_mode";
  const buttonText = theme === "light" ? "Dark Mode" : theme === "dark" ? "Fun Mode" : theme === "fun" ? "Colorblind Mode" : "Light Mode";
  const logoSource = theme === "light" ? IconImage : whiteIcon;

  const logout = async () => {
    await fetch((import.meta.env.VITE_API_URL || "http://localhost:4000") + "/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    window.location.href = "/login";
  };

  return (
    <nav className="app-nav">
      <Link to="/">
        <img
          src={logoSource}
          alt="Site Logo"
          style={{ height: 64, width: 64 }}
        />
      </Link>

      {isProtectedPage && (
        <>
          {isSettings && (
            <Link 
              to="/dashboard"
              style={{ 
                fontFamily: 'Rodchenko, sans-serif', 
                fontSize: '1.5em', 
                fontWeight: 600,
                marginLeft: 16,
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              DASHBOARD
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          )}
          <span
            style={{ 
              fontFamily: 'Rodchenko, sans-serif', 
              fontSize: '1.5em', 
              fontWeight: 600,
              marginLeft: isSettings ? 16 : 16,
              color: 'inherit'
            }}
          >
            {isDashboard ? "DASHBOARD" : "SETTINGS"}
          </span>
        </>
      )}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {!isProtectedPage && (
          <>
            <Link to="/">Home</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
            
          </>
        )}

        {isProtectedPage && (
          <>
            <Link
              to="/settings"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                fontSize: "1em",
                fontWeight: 600,
                border: "none",
                borderRadius: 20,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: 'Rodchenko, sans-serif',
                backgroundColor: theme === "colorblind" ? "#ff5800" : "#fcbd16",
                color: theme === "colorblind" ? "#FFFFFF" : "#000000",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme === "colorblind" ? "#1E90FF" : "#7c2adf";
                e.target.style.color = "white";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme === "colorblind" ? "#ff5800" : "#fcbd16";
                e.target.style.color = theme === "colorblind" ? "#FFFFFF" : "#000000";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.2em" }}>
                settings
              </span>
              Settings
            </Link>

            <button
              onClick={logout}
              style={{
                padding: "8px 20px",
                fontSize: "1em",
                fontWeight: 600,
                border: "none",
                borderRadius: 20,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: 'Rodchenko, sans-serif',
                backgroundColor: theme === "colorblind" ? "#ff5800" : "#fcbd16",
                color: theme === "colorblind" ? "#FFFFFF" : "#000000",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme === "colorblind" ? "#1E90FF" : "#7c2adf";
                e.target.style.color = "white";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme === "colorblind" ? "#ff5800" : "#fcbd16";
                e.target.style.color = theme === "colorblind" ? "#FFFFFF" : "#000000";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              Log Out
            </button>
          </>
        )}

        <button
          onClick={toggleTheme}
          style={{ padding: "4px 8px", fontSize: "0.9em" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "1.6em",
              color: "inherit",
            }}
          >
            {iconName}
          </span>
          {buttonText}
        </button>
      </div>
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
        <Route path="/education" element={user ? <Education userId={user.id} /> : <Navigate to="/login" />} />
        <Route path="/certifications" element={user ? <Certifications /> : <Navigate to="/login" />}/>
        <Route path="/profile-dashboard" element={user ? <ProfileDashboard /> : <Navigate to="/login" />} />
        <Route path="/portfolio" element={user ? <Portfolio /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard-icons" element={user ? <DashboardIcon /> : <Navigate to="/login" />} />
        <Route
          path="/profile"
          element={user ? <Profile userId={user.id} /> : <Navigate to="/login" />}
        />
        <Route
          path="/icons"
          element={user ? <DashboardIcon /> : <Navigate to="/login" />}
        />
        {/* public / marketing */}
        <Route path="/" element={<Home />} />

        {/* auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />

        {/* app / protected-ish pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/board" element={<SkillsBoard />} />
        <Route path="/employment" element={<EmploymentHistory />} />
        <Route path="/employment/new" element={<EmploymentAddForm />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/profile/basic" element={<ProfileBasicForm />} />



        <Route path="/settings" element={<Settings />} /> {/* 👈 NEW */}

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
// render root
ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
