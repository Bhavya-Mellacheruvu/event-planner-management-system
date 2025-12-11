import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/EventRequestDetails.css"; 
import "../styles/NewRequest.css"; 
import Header from "./Header";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

export default function NewEventRequest() {
  const [form, setForm] = useState({
    city: "",
    event_name: "",
    event_desc: "",
    theme_pref: "",
    overall_budget: "",
    request_type_id: "",   // <-- UPDATED
    guest_count: "",
    event_start_date: "",
    notes: ""
  });

  const [requestTypes, setRequestTypes] = useState([]); // <-- store dropdown values

  // Fetch request types from backend
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const { data } = await api.get("/api/event-request/request-types"); 
        setRequestTypes(data);
      } catch (err) {
        console.error("Failed to load request types", err);
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (e) => 
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.city || !form.theme_pref || !form.overall_budget 
      || Number(form.overall_budget) <= 0) {
      return alert("Please provide city, theme and a budget > 0");
    }

    if (!form.request_type_id) {
      return alert("Please select an event type.");
    }

    try {
      const clientId = localStorage.getItem("user_id");

      const payload = {
        client_id: clientId,
        event_name: form.event_name,
        event_desc: form.event_desc,
        city: form.city,
        theme: form.theme_pref,
        budget: parseFloat(form.overall_budget),
        request_type_id: parseInt(form.request_type_id), // <-- UPDATED
        guest_count: parseInt(form.guest_count || 0, 10),
        notes: form.notes,
        event_start_date: form.event_start_date || null
      };

      await api.post("/api/event-request/create", payload);
      alert("Request created successfully");
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Create failed");
    }
  };

  return (
    <div className="ne-page-container">
      <div className="ne-card">
        <Header/>
        <h2 className="ne-title">Create Event Request</h2>

        <form className="ne-form" onSubmit={handleSubmit}>

          <div className="ne-field">
            <label>Event Request Name</label>
            <input name="event_name" value={form.event_name} onChange={handleChange} required />
          </div>

          <div className="ne-field">
            <label>Event Request Description</label>
            <input name="event_desc" value={form.event_desc} onChange={handleChange} required />
          </div>

          <div className="ne-field">
            <label>City</label>
            <input name="city" value={form.city} onChange={handleChange} required />
          </div>

          <div className="ne-field">
            <label>Theme Preference</label>
            <input name="theme_pref" value={form.theme_pref} onChange={handleChange} required />
          </div>

          {/* UPDATED DROPDOWN */}
          <div className="ne-field">
            <label>Request Type</label>
            <select
              name="request_type_id"
              value={form.request_type_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Event Type --</option>

              {requestTypes.map((t) => (
                <option key={t.request_type_id} value={t.request_type_id}>
                  {t.request_type}
                </option>
              ))}
            </select>
          </div>

          <div className="ne-field">
            <label>Guest Count</label>
            <input name="guest_count" type="number" min="0" value={form.guest_count} onChange={handleChange} />
          </div>

          <div className="ne-field">
            <label>Overall Budget</label>
            <input name="overall_budget" type="number" min="0" step="0.01" value={form.overall_budget} onChange={handleChange} required />
          </div>

          <div className="ne-field">
            <label>Preferred Event Start Date</label>
            <input name="event_start_date" type="datetime-local" value={form.event_start_date} onChange={handleChange} />
          </div>

          <div className="ne-field">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </div>

          <div className="ne-button-row">
            <button className="primary-btn ne-submit-btn" type="submit">
              Submit
            </button>

            <button
              type="button"
              className="secondary-btn ne-cancel-btn"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
