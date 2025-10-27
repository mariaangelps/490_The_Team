import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { post } from "../api";

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
    <div style={{ padding: 12, maxWidth: 420 }}>
      <h2>Create a new password</h2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <form onSubmit={submit} style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <input type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e=>setConfirm(e.target.value)} required />
        <button>Reset password</button>
      </form>
    </div>
  );
}
