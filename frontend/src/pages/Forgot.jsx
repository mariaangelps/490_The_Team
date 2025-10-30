import { useState } from "react";
import { post } from "../api";
import Button from "../reusableButton.jsx";
import "./forgot.css";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await post("/api/auth/reset/request", { email }); // always returns success
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="forgot-form-container">
      <h2 className="forgot-header">Reset your password</h2>
      {sent ? (
        <p className="forgot-info">If an account exists for that email, a reset link has been sent.</p>
      ) : (
        <form onSubmit={submit} className="forgot-form">
          <input
            className="forgot-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="forgot-button" disabled={loading}>
            {loading ? (
              <>
                <span className="material-symbols-outlined rotating">progress_activity</span>
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
