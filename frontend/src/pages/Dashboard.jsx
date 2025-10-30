import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../main.jsx";
import "./dashboard.css";

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);
  
    // Colorblind mode palette limited to requested colors
    const colorblindColors = {
      blue: "#1E90FF",     // DodgerBlue
      orange: "#ff5800",   // Vivid Orange
      black: "#000000",
      white: "#FFFFFF"
    };
    const brand = {
      purple: "#7C2ADF",
      pink: "#D24BB9",
      amber: "#FCBD16",
      teal: "#0ea5a3",
    };
  
  // Card data - customize these links and content as needed
  const cards = [
    {
      id: 1,
      title: "Upload Resume",
      description: "Start by uploading your resume to get AI-powered insights",
      link: "/upload",
    icon: "upload_file",
    color: theme === "colorblind" ? colorblindColors.blue : "#7C2ADF",
    },
    {
      id: 2,
      title: "Settings",
      description: "Customize your account preferences and appearance",
      link: "/settings",
    icon: "settings",
    color: theme === "colorblind" ? colorblindColors.orange : "#D24BB9",
    },
    {
      id: 3,
      title: "My Resumes",
      description: "View and manage all your resume versions",
      link: "/resumes",
  icon: "description",
  color: theme === "colorblind" ? colorblindColors.blue : "#FCBD16",
    },
    {
      id: 4,
      title: "Job Matches",
      description: "Find jobs that match your resume profile",
      link: "/jobs",
  icon: "work",
  color: theme === "colorblind" ? colorblindColors.orange : "#7C2ADF",
    },
    {
      id: 5,
      title: "Analytics",
      description: "Track your resume performance and optimization scores",
      link: "/analytics",
    icon: "analytics",
    color: theme === "colorblind" ? colorblindColors.blue : "#D24BB9",
    },
    {
      id: 6,
      title: "Templates",
      description: "Browse professional resume templates",
      link: "/templates",
    icon: "article",
    color: theme === "colorblind" ? colorblindColors.orange : "#FCBD16",
    },
    {
      id: 7,
      title: "Employment History",
      description: "View and edit your work experience timeline",
      link: "/employment",          // <-- Navigates to your EmploymentHistory.jsx page
      icon: "history",
      color: theme === "colorblind" ? colorblindColors.blue : "#7C2ADF",
    },
    {
      id: 8,
      title: "Skills",
      description: "Add, edit, and organize your skills & proficiency",
      link: "/skills",
      icon: "workspace_premium", // o "construction", "star"
      color: theme === "colorblind" ? colorblindColors.orange : brand.teal,
    },
  ];

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Dashboard</h2>
      
      <div className="masonry-grid">
        {cards.map((card) => (
          <Link 
            key={card.id}
            to={card.link}
            className="dashboard-card"
            style={{ '--card-color': card.color }}
          >
            <div className="card-icon">
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-description">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}