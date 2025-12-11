import React, { useState } from "react";
import "../styles/Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  const userName = localStorage.getItem("user_name") || "User";
  const role = localStorage.getItem("role") || "";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="app-header">
      <h2 className="logo">Event Planner</h2>

      <div className="profile-container">
        <div className="profile-text" onClick={() => setOpen(!open)}>
          {userName} ({role})
        </div>

        {open && (
          <div className="dropdown-menu">
            <a href="/profile">Profile</a>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
