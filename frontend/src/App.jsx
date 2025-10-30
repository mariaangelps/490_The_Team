import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import Settings from "./pages/Settings.jsx"; // <-- we'll create this next
import EmploymentHistory from "./pages/EmploymentHistory.jsx";


function App() {
  return (
    <BrowserRouter>
      {/* super minimal nav just so you can move around during dev */}
      <nav style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>
        <Link to="/dashboard" style={{ marginRight: 12 }}>Dashboard</Link>
        <Link to="/settings" style={{ marginRight: 12 }}>Settings</Link>
        <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
      </nav>

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/employment" element={<EmploymentHistory />} />


        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* UC-006 / UC-007 stuff */}
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />

        {/* fallback route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;