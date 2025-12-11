import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Profile.css";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const Profile = () => {
  const token = localStorage.getItem("token");
  const { role } = jwtDecode(token); // "client" or "manager"

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    personal_details: "",
    experience: "",
    specialization: "",
    password: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/api/users/me");

      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone_number: res.data.phone_number || "",
        personal_details: res.data.personal_details || "",
        experience: res.data.experience || "",
        specialization: res.data.specialization || "",
        password: "", // always blank on load
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put("/api/users/update", form);
      alert("Profile updated!");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <form className="profile-form" onSubmit={handleUpdate}>

        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} />

        <label>Contact Number</label>
        <input
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          placeholder="Enter phone number"
        />

        {/* CLIENT ONLY FIELD */}
        {role === "client" && (
          <>
            <label>Personal Details</label>
            <textarea
              name="personal_details"
              value={form.personal_details}
              onChange={handleChange}
            />
          </>
        )}

        {/* MANAGER ONLY FIELDS */}
        {role === "manager" && (
          <>
            <label>Experience</label>
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
            />

            <label>Specialization</label>
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
            />
          </>
        )}

        <label>Updated Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter new password"
          onChange={handleChange}
        />

        <button className="primary-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default Profile;
