import React from "react";
import Header from "./Header";
import "../styles/Layout.css";

export default function Layout({ children }) {
  const token = localStorage.getItem("token");

  return (
    <div className="global-layout">
        

      <div className="page-container">{children}</div>
    </div>
  );
}
