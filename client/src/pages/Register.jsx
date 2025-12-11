import React, { useState } from "react";
import axios from "axios";
import "../styles/Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    phone_number: "",
    role: "client",
    personal_details: "",
    experience: "",
    specialization: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "http://localhost:8080/api/users/register", 
        formData
      );

      setSuccess("Registration successful!");
      alert("Account created successfully!");

      // Optional → redirect after creating account
      window.location.href = "/login";

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input 
            type="text" 
            name="name" 
            onChange={handleChange} 
            value={formData.name} 
            required 
          />

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

          <label>Contact Number</label>
          <input 
            type="phone_number" 
            name="phone_number" 
            onChange={handleChange} 
            value={formData.phone_number} 
            required 
          />

          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="client">Client</option>
            <option value="manager">Event Manager</option>
          </select>

          {/* Client fields */}
          {formData.role === "client" && (
            <>
              <label>Personal Details</label>
              <textarea
                name="personal_details"
                value={formData.personal_details}
                onChange={handleChange}
              />
            </>
          )}

          {/* Manager fields */}
          {formData.role === "manager" && (
            <>
              <label>Experience (Years)</label>
              <input
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
              />

              <label>Specialization</label>
              <input
                name="specialization"
                type="text"
                value={formData.specialization}
                onChange={handleChange}
              />
            </>
          )}

          <button type="submit" className="auth-btn">
            Register
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
