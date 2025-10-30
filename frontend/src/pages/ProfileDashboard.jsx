import React, { useEffect, useState } from "react";

// Dummy data for now (replace with API calls later)
const dummyProfile = {
  employment: [
    { company: "ABC Corp", role: "Developer", start: "2022", end: "Present" },
  ],
  skills: [
    { name: "JavaScript", level: 80 },
    { name: "React", level: 70 },
    { name: "Node.js", level: 65 },
  ],
  education: [
    { school: "NJIT", degree: "B.Sc Computer Science", year: 2024 },
  ],
  projects: [
    { title: "Portfolio Website", date: "2025-01-01" },
    { title: "ATS App", date: "2025-05-01" },
  ],
  recentActivity: [
    { action: "Added project 'Portfolio Website'", date: "2025-10-26" },
  ],
};

export default function ProfileDashboard() {
  const [profile, setProfile] = useState(dummyProfile);

  // Calculate profile completion %
  const totalSections = 4;
  const completedSections =
    (profile.employment.length ? 1 : 0) +
    (profile.skills.length ? 1 : 0) +
    (profile.education.length ? 1 : 0) +
    (profile.projects.length ? 1 : 0);
  const completion = Math.round((completedSections / totalSections) * 100);

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile Dashboard</h2>

      {/* Completion Bar */}
      <div style={{ margin: "10px 0" }}>
        <strong>Profile Completion:</strong> {completion}%
        <div
          style={{
            height: 10,
            width: "100%",
            background: "#eee",
            borderRadius: 5,
            overflow: "hidden",
            marginTop: 4,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${completion}%`,
              background: "#4caf50",
            }}
          />
        </div>
      </div>

      {/* Quick-add Buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button>Add Employment</button>
        <button>Add Skill</button>
        <button>Add Education</button>
        <button>Add Project</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ border: "1px solid #ccc", padding: 10, width: 200 }}>
          <h3>Employment</h3>
          {profile.employment.map((job, i) => (
            <div key={i}>
              {job.role} @ {job.company} ({job.start} - {job.end})
            </div>
          ))}
        </div>

        <div style={{ border: "1px solid #ccc", padding: 10, width: 200 }}>
          <h3>Skills</h3>
          {profile.skills.map((skill, i) => (
            <div key={i}>
              {skill.name} - {skill.level}%
              <div
                style={{
                  height: 6,
                  width: "100%",
                  background: "#eee",
                  borderRadius: 3,
                  overflow: "hidden",
                  margin: "2px 0",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${skill.level}%`,
                    background: "#2196f3",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ border: "1px solid #ccc", padding: 10, width: 200 }}>
          <h3>Education</h3>
          {profile.education.map((edu, i) => (
            <div key={i}>
              {edu.degree} @ {edu.school} ({edu.year})
            </div>
          ))}
        </div>

        <div style={{ border: "1px solid #ccc", padding: 10, width: 200 }}>
          <h3>Projects</h3>
          {profile.projects.map((proj, i) => (
            <div key={i}>
              {proj.title} ({proj.date})
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: 20 }}>
        <h3>Recent Activity</h3>
        <ul>
          {profile.recentActivity.map((act, i) => (
            <li key={i}>
              {act.action} - {act.date}
            </li>
          ))}
        </ul>
      </div>

      {/* Export Button */}
      <button style={{ marginTop: 20 }}>Export Profile Summary</button>
    </div>
  );
}
