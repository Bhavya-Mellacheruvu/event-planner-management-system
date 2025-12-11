import React, { useState } from "react";
import axios from "axios";
// Import useNavigate for smooth routing
import { useNavigate } from "react-router-dom"; 
import "../styles/Auth.css";

const Login = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:8080/api/users/login", formData);

      // Save authentication info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // Use navigate hook for smoother routing
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
   
    <div className="auth-container">
      {/* ADDED: Event Planner Header */}
      <h1 className="app-main-title">Event Planner </h1>
      
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            onChange={handleChange} 
            value={formData.email} 
            required 
          />

          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            onChange={handleChange} 
            value={formData.password} 
            required 
          />

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;