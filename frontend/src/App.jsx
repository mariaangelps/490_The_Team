import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import Settings from "./pages/Settings.jsx";
import EmploymentHistory from "./pages/EmploymentHistory.jsx";
import SkillsManager from "./pages/Skills.jsx";
import EducationPage from "./pages/Education.jsx";
import EmploymentAddForm from "./pages/EmploymentAddForm.jsx";
import ProfileBasicForm from "./pages/ProfileBasicForm.jsx";

// ✅ Additional imports for the new pages
import Profile from "./pages/profile.jsx";
import Certifications from "./pages/Certifications.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import AddProject from "./pages/AddProject.jsx";
import DashboardIcon from "./pages/dashboardicon.jsx";
import ProfileDashboard from "./pages/ProfileDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      {/* minimal navigation bar for testing routes */}
      <nav style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>
        <Link to="/dashboard" style={{ marginRight: 12 }}>Dashboard</Link>
        <Link to="/settings" style={{ marginRight: 12 }}>Settings</Link>
        <Link to="/login" style={{ marginRight: 12 }}>Login</Link>
      </nav>

      <Routes>
        {/* Core routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/employment" element={<EmploymentHistory />} />
        <Route path="/skills" element={<SkillsManager />} />
        <Route path="/education" element={<EducationPage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />

        {/* ✅ Added routes for profile system */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/icons" element={<DashboardIcon />} />
        <Route path="/profile-dashboard" element={<ProfileDashboard />} />

        {/* Fallback route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
