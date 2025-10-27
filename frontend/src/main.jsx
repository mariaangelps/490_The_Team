import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import "./main.css";
import IconImage from './assets/THE.png';
import DarkIconImage from './assets/THE(yellow).png';
import whiteIcon from './assets/THE(white).png';
import Button from "./reusableButton.jsx";

const ThemeContext = createContext();

function scrollToElement(id) {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset + 50; // Reduced offset to scroll further down

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

//home page

function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '200vh' }}>
      {/* Top section with welcome message and scroll button */}
      <div style={{ 
        height: '50vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 12,
        textAlign: 'center'
      }}>
        <h1>Revamp Your Resume</h1>
        <p style={{ maxWidth: 600 }}> Get past those pesky ATS's by using AI on your own resume! </p>
        
        {/* REPLACED standard button with new Button component */}
        <Button 
          variant="scroll" // Uses the .scroll-button styles from main.css
          className="scroll-button"
          onClick={() => scrollToElement('auth-links-nav')}
          style={{ marginTop: 32, padding: '10px 20px' }}
        >
          <span className="material-symbols-outlined">arrow_downward</span>
        </Button>
      </div>

      {/* Bottom section with auth buttons */}
      <div id="auth-links-nav" className="cta-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* REPLACED Link with new Button component */}
          {/* Primary Button: Register (Visually emphasized) */}
          <Button to="/register" variant="primary">
            Create an Account
          </Button>

          <span style={{ opacity: 0.7 }}>or</span>
          
          {/* REPLACED Link with new Button component */}
          {/* Secondary Button: Login (Less visual emphasis) */}
          <Button to="/login" variant="secondary">
            Log In
          </Button>
      </div>
      </div>
    </div>
  );
}
  

function ThemeProvider({ children }) {
  // Check localStorage for a saved theme, default to 'light'
  const [theme, setTheme] = useState(
    localStorage.getItem('app-theme') || 'light'
  );

  // Apply theme class to the body element whenever the theme state changes
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('app-theme', theme); // Save the preference locally
  }, [theme]);

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return (

    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function Nav() {
  // FIX: useContext must use the consistently named ThemeContext
  const { theme, toggleTheme } = useContext(ThemeContext);
  const iconName = theme === 'light' ? 'dark_mode' : 'light_mode';
  const buttonText = theme === 'light' ? 'Dark Mode' : 'Light Mode';
  let logoSource = theme === 'light' ? IconImage : whiteIcon;

  return (
    <nav className ="app-nav">
      
      <Link to="/">
        <img 
          src={logoSource} 
          alt="Site Logo" 
          style={{ height: 64, width: 64 }} // Set your desired size
        />
      </Link>
  
      <div 
        style={{ 
            marginLeft: 'auto', 
            display: 'flex', 
            alignItems: 'middle', 
            gap: '20px' // Adjust spacing between links/button
        }}
      ></div>

      <Link to="/">Home</Link>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <button 
        onClick={toggleTheme} 
        style={{marginLeft:'auto', padding: '4px 8px', fontSize: '0.9em' }}
        >
        <span 
          className="material-symbols-outlined"
          style={{
            fontSize: '1.6em', 
            color: 'inherit' 
          }}
        >
          {iconName} 
        </span>
        {buttonText}
      </button>

    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// 4. FIX: Wrap the App component with the ThemeProvider here
ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);