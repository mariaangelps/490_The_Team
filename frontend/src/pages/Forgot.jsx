import { useState } from "react";
import { post } from "../api";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await post("/api/auth/reset/request", { email }); // always returns success
    setSent(true);
  };

  return (
    <div style={{ padding: 12, maxWidth: 420 }}>
      <h2>Reset your password</h2>
      {sent ? (
        <p>If an account exists for that email, a reset link has been sent.</p>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <button>Send reset link</button>
        </form>
      )}
    </div>
  );
}
