import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount } from "../api.js";

export default function Settings() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div style={{ padding: 16, maxWidth: 480 }}>
      <h2>Account Settings</h2>

      <section style={{
        marginTop: 24,
        padding: 16,
        border: "1px solid #f5c2c7",
        background: "#fff5f5",
        borderRadius: 8
      }}>
        <h3 style={{ color: "#b91c1c", marginTop: 0 }}>Danger Zone</h3>
        <p style={{ fontSize: 14, lineHeight: 1.4, color: "#444" }}>
          Deleting your account is <strong>permanent</strong>. All your data will be removed
          and you will be logged out immediately. This cannot be undone.
        </p>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 14
            }}
          />
        </div>

        {error && (
          <div style={{ color: "#b91c1c", fontSize: 14, marginTop: 8 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleDeleteClick}
          disabled={loading}
          style={{
            marginTop: 20,
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            padding: "10px 14px",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            opacity: loading ? 0.6 : 1
          }}
        >
          Delete My Account
        </button>
      </section>

      {/* confirmation modal-ish */}
      {confirmOpen && (
        <div style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          zIndex: 9999
        }}>
          <div style={{
            background: "white",
            borderRadius: 8,
            maxWidth: 360,
            width: "100%",
            padding: 20,
            boxShadow: "0 12px 24px rgba(0,0,0,0.2)"
          }}>
            <h4 style={{ marginTop: 0, marginBottom: 12 }}>Are you sure?</h4>
            <p style={{ fontSize: 14, lineHeight: 1.4, color: "#444" }}>
              This will permanently delete your account and log you out. This cannot be undone.
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  padding: "10px 12px",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

              <button
                onClick={actuallyDelete}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "10px 12px",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: loading ? 0.6 : 1
                }}
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
