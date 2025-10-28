import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";

// 👇 IMPORTA TU FORM (.tsx funciona bien con Vite)
import ProfileBasicForm from "./features/profile/ProfileBasicForm.tsx";

function Nav() {
  return (
    <nav style={{ display: "flex", gap: 12, padding: 12 }}>
      <Link to="/">Home</Link>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <Link to="/profile">Profile</Link> {/* nuevo link */}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />

        {/* 👇 AQUÍ SE RENDERIZA TU FORM */}
        <Route
          path="/profile"
          element={<ProfileBasicForm onCancel={() => window.history.back()} />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);