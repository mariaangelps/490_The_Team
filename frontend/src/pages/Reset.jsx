import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { post } from "../api";
import Button from "../reusableButton.jsx";
import "./reset.css";

export default function Reset() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await post("/api/auth/reset/complete", { token, password, confirmPassword });
      window.location.href = "/dashboard"; // auto-login on success
    } catch (err) {
      setError(err?.message || "Invalid or expired link");
    }
  };

  return (
    <div className="reset-form-container">
      <h2 className="reset-header">Create a new password</h2>
      {error && <div className="reset-error">{error}</div>}
      <form onSubmit={submit} className="reset-form">
        <input
          className="reset-input"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="reset-input"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" className="reset-button">
          Reset password
        </Button>
      </form>
    </div>
  );
}
