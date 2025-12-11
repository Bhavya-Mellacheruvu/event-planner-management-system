import React, { useState } from "react";
import axios from "axios";
import "../styles/CreateEvent.css";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "./Header";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

export default function CreateEvent() {
  const { request_id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    event_type: "",
    event_description: "",
    venue: "",
    guest_count: 0,
    start_date: "",
    approved_budget: 0,
  });

  const [error, setError] = useState("");

  // Role check
  const isManager = () => {
    try {
      const decoded = jwtDecode(localStorage.getItem("token"));
      return decoded.role === "manager";
    } catch {
      return false;
    }
  };

  if (!isManager()) {
    return <div className="ce-page-container">Unauthorized Access</div>;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // clear previous error

    try {
      await api.post("/api/events/create", {
        request_id,
        ...form,
      });

      alert("Event created successfully!");
      navigate(`/request/${request_id}`);

    } catch (err) {
      console.error("Create Event Error:", err);

      // Show backend validation error in UI
      const message = err.response?.data?.error || "Failed to create event.";
      setError(message);
    }
  };


  return (
    <div className="ce-page-container">

      <div className="ce-card">
        <Header />

        <h2 className="ce-title">Create Event</h2>

        <form className="ce-form" onSubmit={handleSubmit}>
          {error && <p className="ce-error">{error}</p>}

          <div className="ce-field">
            <label>Event Type</label>
            <input
              type="text"
              name="event_type"
              placeholder="Please mention the event type"
              value={form.event_type}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ce-field">
            <label>Event Description</label>
            <input
              type="text"
              name="event_description"
              placeholder="Short description"
              value={form.event_description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ce-field">
            <label>Venue</label>
            <input
              type="text"
              name="venue"
              value={form.venue}
              onChange={handleChange}
            />
          </div>

          <div className="ce-field">
            <label>Guest Count</label>
            <input
              type="number"
              name="guest_count"
              value={form.guest_count}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ce-field">
            <label>Start Date & Time</label>
            <input
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ce-field">
            <label>Approved Budget (₹)</label>
            <input
              type="number"
              name="approved_budget"
              value={form.approved_budget}
              onChange={handleChange}
              required
            />
          </div>

          {/* Buttons */}
          <div className="ce-button-row">
            <button className="ce-btn-primary" type="submit">
              Create Event
            </button>

            <button
              className="ce-btn-secondary"
              type="button"
              onClick={() => navigate(`/request/${request_id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
