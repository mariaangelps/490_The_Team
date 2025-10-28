import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";

import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import ProfileBasicForm from "./features/profile/ProfileBasicForm.tsx"; // 👈 import UC-021

import "./main.css";
import IconImage from "./assets/THE.png";
import DarkIconImage from "./assets/THE(yellow).png"; // unused currently
import whiteIcon from "./assets/THE(white).png";
import Button from "./reusableButton.jsx";

const ThemeContext = createContext();

function scrollToElement(id) {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset + 50;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}

// home page
function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "200vh" }}>
      {/* Top section */}
      <div
        style={{
          height: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
          textAlign: "center",
        }}
      >
        <h1>Revamp Your Resume</h1>
        <p style={{ maxWidth: 600 }}>
          Get past those pesky ATS's by using AI on your own resume!
        </p>

        <Button
          variant="scroll"
          className="scroll-button"
          onClick={() => scrollToElement("auth-links-nav")}
          style={{ marginTop: 32, padding: "10px 20px" }}
        >
          <span className="material-symbols-outlined">arrow_downward</span>
        </Button>
      </div>

      {/* bottom CTA section */}
      <div id="auth-links-nav" className="cta-group">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Button to="/register" variant="primary">
            Create an Account
          </Button>

          <span style={{ opacity: 0.7 }}>or</span>

          <Button to="/login" variant="secondary">
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem("app-theme") || "light");

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function Nav() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const iconName = theme === "light" ? "dark_mode" : "light_mode";
  const buttonText = theme === "light" ? "Dark Mode" : "Light Mode";
  const logoSource = theme === "light" ? IconImage : whiteIcon;

  return (
    <nav className="app-nav">
      <Link to="/">
        <img
          src={logoSource}
          alt="Site Logo"
          style={{ height: 64, width: 64 }}
        />
      </Link>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      ></div>

      <Link to="/">Home</Link>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <Link to="/profile">Profile</Link>

      <button
        onClick={toggleTheme}
        style={{ marginLeft: "auto", padding: "4px 8px", fontSize: "0.9em" }}
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
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        {/* public / marketing */}
        <Route path="/" element={<Home />} />

        {/* auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />

        {/* app / protected-ish pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} /> {/* 👈 NEW */}

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/profile" element={<ProfileBasicForm onCancel={() => window.history.back()} />}/>
      </Routes>
    </BrowserRouter>
  );
}

// render root
ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
