import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../main.jsx";
import "./dashboard.css";

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);

  // Colorblind mode palette
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

  // ✅ COMBINED CARD LIST
  const cards = [
    {
      id: 1,
      title: "Upload Resume",
      description: "Start by uploading your resume to get AI-powered insights",
      link: "/upload",
      icon: "upload_file",
      color: theme === "colorblind" ? colorblindColors.blue : brand.purple,
    },
    {
      id: 2,
      title: "Settings",
      description: "Customize your account preferences and appearance",
      link: "/settings",
      icon: "settings",
      color: theme === "colorblind" ? colorblindColors.orange : brand.pink,
    },
    {
      id: 3,
      title: "My Resumes",
      description: "View and manage all your resume versions",
      link: "/resumes",
      icon: "description",
      color: theme === "colorblind" ? colorblindColors.blue : brand.amber,
    },
    {
      id: 4,
      title: "Job Matches",
      description: "Find jobs that match your resume profile",
      link: "/jobs",
      icon: "work",
      color: theme === "colorblind" ? colorblindColors.orange : brand.purple,
    },
    {
      id: 5,
      title: "Analytics",
      description: "Track your resume performance and optimization scores",
      link: "/analytics",
      icon: "analytics",
      color: theme === "colorblind" ? colorblindColors.blue : brand.pink,
    },
    {
      id: 6,
      title: "Templates",
      description: "Browse professional resume templates",
      link: "/templates",
      icon: "article",
      color: theme === "colorblind" ? colorblindColors.orange : brand.amber,
    },
    {
      id: 7,
      title: "Employment History",
      description: "View and edit your work experience timeline",
      link: "/employment",
      icon: "history",
      color: theme === "colorblind" ? colorblindColors.blue : brand.purple,
    },
    {
      id: 8,
      title: "Skills",
      description: "Add, edit, and organize your skills & proficiency",
      link: "/skills",
      icon: "workspace_premium",
      color: theme === "colorblind" ? colorblindColors.orange : brand.teal,
    },
    {
      id: 9,
      title: "Education",
      description: "Add and manage your educational background",
      link: "/education",
      icon: "school",
      color: theme === "colorblind" ? colorblindColors.blue : brand.purple,
    },
    {
      id: 10,
      title: "Certifications",
      description: "Upload and view your certifications",
      link: "/certifications",
      icon: "verified",
      color: theme === "colorblind" ? colorblindColors.orange : brand.pink,
    },
    {
      id: 11,
      title: "Portfolio",
      description: "Showcase your work and projects",
      link: "/portfolio",
      icon: "folder_special",
      color: theme === "colorblind" ? colorblindColors.blue : brand.amber,
    },
    {
      id: 12,
      title: "Profile Picture",
      description: "Upload or change your profile picture",
      link: "/profile",
      icon: "account_circle",
      color: theme === "colorblind" ? colorblindColors.orange : brand.teal,
    },
    {
      id: 13,
      title: "Add Project",
      description: "Create and manage new projects",
      link: "/add-project",
      icon: "add_circle",
      color: theme === "colorblind" ? colorblindColors.blue : brand.purple,
    },
    {
      id: 14,
      title: "Icons",
      description: "Explore available dashboard icons",
      link: "/icons",
      icon: "apps",
      color: theme === "colorblind" ? colorblindColors.orange : brand.amber,
    },
    {
      id: 15,
      title: "Profile Dashboard",
      description: "View and edit your profile dashboard",
      link: "/profile-dashboard",
      icon: "person",
      color: theme === "colorblind" ? colorblindColors.blue : brand.teal,
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
