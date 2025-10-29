import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../api.js";
import { ThemeContext } from "../main.jsx";
import "./settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);
  const [password, setPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [showThemeSection, setShowThemeSection] = useState(false);
  const [showTextSizeSection, setShowTextSizeSection] = useState(false);
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem("textSize") || "regular";
  });

  useEffect(() => {
    document.body.setAttribute("data-text-size", textSize);
    localStorage.setItem("textSize", textSize);
  }, [textSize]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowThemeSection(false);
  };

  const handleTextSizeChange = (newSize) => {
    setTextSize(newSize);
    setShowTextSizeSection(false);
  };

  const handleDeleteClick = () => {
    // require them to type a password first
    if (!password.trim()) {
      setError("Please enter your password first.");
      return;
    }
    setError("");
    setConfirmOpen(true);
  };

  const actuallyDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await deleteAccount(password);

      // after successful deletion:
      // 1. clear any client-side auth state if you store it later
      // 2. send user to login page
      navigate("/login", { replace: true });
    } catch (err) {
      // err could be a string or { message }
      const msg = typeof err === "string" ? err : err?.message || "Failed to delete account";
      setError(msg);
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-header">Account Settings</h2>

      {/* Theme Toggle Section */}
      <div className="theme-section">
        <button 
          className="toggle-theme-button"
          onClick={() => setShowThemeSection(!showThemeSection)}
        >
          <span className="material-symbols-outlined">
            {showThemeSection ? "expand_less" : "expand_more"}
          </span>
          Appearance
        </button>

        {showThemeSection && (
          <div className="theme-section-content">
            <p className="theme-description">Choose your preferred theme</p>
            
            <div className="theme-options">
              <button
                className={`theme-option ${theme === "light" ? "active" : ""}`}
                onClick={() => handleThemeChange("light")}
              >
                <span className="material-symbols-outlined">light_mode</span>
                <span className="theme-option-text">Light Mode</span>
              </button>

              <button
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                onClick={() => handleThemeChange("dark")}
              >
                <span className="material-symbols-outlined">dark_mode</span>
                <span className="theme-option-text">Dark Mode</span>
              </button>

              <button
                className={`theme-option ${theme === "auto" ? "active" : ""}`}
                onClick={() => handleThemeChange("auto")}
              >
                <span className="material-symbols-outlined">contrast</span>
                <span className="theme-option-text">Auto (System)</span>
              </button>

              <button
                className={`theme-option ${theme === "fun" ? "active" : ""}`}
                onClick={() => handleThemeChange("fun")}
              >
                <span className="material-symbols-outlined">palette</span>
                <span className="theme-option-text">Fun Mode</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Text Size Section */}
      <div className="text-size-section">
        <button 
          className="toggle-text-size-button"
          onClick={() => setShowTextSizeSection(!showTextSizeSection)}
        >
          <span className="material-symbols-outlined">
            {showTextSizeSection ? "expand_less" : "expand_more"}
          </span>
          Text Size
        </button>

        {showTextSizeSection && (
          <div className="text-size-section-content">
            <p className="text-size-description">Choose your preferred text size</p>
            
            <div className="text-size-options">
              <button
                className={`text-size-option ${textSize === "regular" ? "active" : ""}`}
                onClick={() => handleTextSizeChange("regular")}
              >
                <span className="material-symbols-outlined">text_fields</span>
                <span className="text-size-option-text">Regular</span>
              </button>

              <button
                className={`text-size-option ${textSize === "large" ? "active" : ""}`}
                onClick={() => handleTextSizeChange("large")}
              >
                <span className="material-symbols-outlined">text_increase</span>
                <span className="text-size-option-text">Large</span>
              </button>

              <button
                className={`text-size-option ${textSize === "larger" ? "active" : ""}`}
                onClick={() => handleTextSizeChange("larger")}
              >
                <span className="material-symbols-outlined">format_size</span>
                <span className="text-size-option-text">Larger</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="danger-zone">
        <button 
          className="toggle-delete-button"
          onClick={() => setShowDeleteSection(!showDeleteSection)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.2em" }}>
            {showDeleteSection ? "expand_less" : "expand_more"}
          </span>
          Delete Account
        </button>

        {showDeleteSection && (
          <div className="delete-section-content">
            <h3 className="danger-zone-title">Danger Zone</h3>
            <p className="danger-zone-text">
              Deleting your account is <strong>permanent</strong>. All your data will be removed
              and you will be logged out immediately. This cannot be undone.
            </p>

            <div className="password-input-wrapper">
              <label className="password-label">
                Confirm Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="settings-password-input"
              />
            </div>

            {error && (
              <div className="settings-error">
                {error}
              </div>
            )}

            <button
              onClick={handleDeleteClick}
              disabled={loading}
              className="delete-account-button"
            >
              Delete My Account
            </button>
          </div>
        )}
      </div>

      {/* confirmation modal */}
      {confirmOpen && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <h4 className="confirmation-modal-title">Are you sure?</h4>
            <p className="confirmation-modal-text">
              This will permanently delete your account and log you out. This cannot be undone.
            </p>

            <div className="confirmation-modal-buttons">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="cancel-button"
              >
                Cancel
              </button>

              <button
                onClick={actuallyDelete}
                disabled={loading}
                className="confirm-delete-button"
              >
                {loading ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
