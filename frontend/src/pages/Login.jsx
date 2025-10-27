// src/pages/Login.jsx

import { useState } from "react";
// Added Link and useNavigate which are necessary for the component's functionality
import { Link, useNavigate } from "react-router-dom"; 

import { post } from "../api";
import "../assets/login.css";
import Button from "../reusableButton.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Helper component, defined outside Login()
function GoogleButton() {
  return (
    <a
      href={`${API_URL}/api/auth/google`}
      className="google-login-button"
    >
      Continue with Google
    </a>
  );
}

export default function Login() {
  // All state hooks are correctly inside the component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await post('/api/auth/login', { email, password });
      navigate('/dashboard'); 
    } catch (err) {
      if (err.code === 'OAUTH_ONLY') {
        setError('This account uses Google Sign-In. Click “Continue with Google” or set a password.');
      } else {
        setError(err.message || 'Invalid email or password'); 
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="login-form-container">
      <h2 className="login-header">Log in</h2>
      {error && <div className="login-error">{error}</div>}
      <form onSubmit={submit} className="login-form">
        <input
          // REMOVED: the unnecessary '{theme}' class which was causing conflicts.
          className={`login-input`} 
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          // REMOVED: the unnecessary '{theme}' class which was causing conflicts.
          className={`login-input`} 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Reusable Button component is correctly implemented here */}
        <Button 
          type="submit" 
          variant="primary" 
          className="login-button" 
          disabled={isLoading} 
        >
          {isLoading ? 'Logging In...' : 'Log In'}
        </Button>
      </form>
      <GoogleButton />
      <div className="switch-text">
        Don't have an account?{' '}
        {/* Changed <a> tag back to react-router-dom <Link> */}
        <Link to="/register" className="page-switch-link">
          Register here
        </Link>
      </div>
    </div>
  );
}