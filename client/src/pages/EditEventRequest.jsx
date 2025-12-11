import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/EditRequest.css";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

export default function EditEventRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    event_request_name: "",
    event_request_desc: "",
    city: "",
    request_type_id: "",     // UPDATED
    theme_pref: "",
    guest_count: "",
    overall_budget: "",
    notes: "",
    event_start_date: "",
  });

  const [status, setStatus] = useState("");
  const [requestTypes, setRequestTypes] = useState([]);  // NEW
  const [loading, setLoading] = useState(true);

  // ============================
  // FETCH Request Types
  // ============================
  useEffect(() => {
    async function loadTypes() {
      try {
        const { data } = await api.get("/api/event-request/request-types");
        setRequestTypes(data);
      } catch (err) {
        console.error("Failed to load request types", err);
      }
    }
    loadTypes();
  }, []);

  // ============================
  // FETCH Existing Request
  // ============================
  useEffect(() => {
    async function loadRequest() {
      try {
        const res = await api.get(`/api/event-request/${id}`);
        const r = res.data;

        setForm({
          event_request_name: r.event_request_name,
          event_request_desc: r.event_request_desc,
          city: r.city,
          request_type_id: r.request_type_id,      // UPDATED
          theme_pref: r.theme_pref,
          guest_count: r.guest_count,
          overall_budget: r.overall_budget,
          notes: r.notes || "",
          event_start_date: r.event_start_date?.split("T")[0] || "",
        });

        setStatus(r.status);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load request");
      }
    }

    loadRequest();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================
  // SUBMIT UPDATED REQUEST
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status !== "Pending") {
      alert("Only Pending requests can be edited.");
      return;
    }

    try {
      await api.put(`/api/event-request/${id}`, form);
      alert("Request updated successfully!");
      navigate(`/dashboard`);
    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    }
  };

  if (loading) return <h3>Loading...</h3>;

  return (
    <div className="edit-request-container">
      <Header />
      <h2>Edit Event Request</h2>

      <p className="status-info">
        Current Status: <span className={`status status-${status.toLowerCase()}`}>{status}</span>
      </p>

      {status !== "Pending" && (
        <p className="blocked-msg">
          This request cannot be edited because it is <strong>{status}</strong>.
        </p>
      )}

      <form onSubmit={handleSubmit} className="edit-form">
        
        {/* Event Request Name */}
        <label>Event Request Name</label>
        <input
          type="text"
          name="event_request_name"
          value={form.event_request_name}
          onChange={handleChange}
          required
        />

        {/* Description */}
        <label>Event Request Description</label>
        <input
          type="text"
          name="event_request_desc"
          value={form.event_request_desc}
          onChange={handleChange}
          required
        />

        {/* City */}
        <label>City</label>
        <input
          type="text"
          name="city"
          value={form.city}
          onChange={handleChange}
          required
        />

        {/* =============================
            Event Type (Dropdown)
        ============================== */}
        <label>Event Type</label>
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

        {/* Theme Preference */}
        <label>Theme Preference</label>
        <input
          type="text"
          name="theme_pref"
          value={form.theme_pref}
          onChange={handleChange}
          required
        />

        {/* Guest Count */}
        <label>Guest Count</label>
        <input
          type="number"
          name="guest_count"
          value={form.guest_count}
          onChange={handleChange}
          required
        />

        {/* Budget */}
        <label>Overall Budget</label>
        <input
          type="number"
          name="overall_budget"
          value={form.overall_budget}
          onChange={handleChange}
          required
        />

        {/* Date */}
        <label>Preferred Start Date</label>
        <input
          type="date"
          name="event_start_date"
          value={form.event_start_date}
          onChange={handleChange}
        />

        {/* Notes */}
        <label>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />

        <div className="ce-button-row">
          <button 
            type="submit" 
            className="ce-btn-primary"
            disabled={status !== "Pending"}
          >
            Update Request
          </button>

          <button 
            type="button" 
            className="ce-btn-secondary"
            onClick={() => navigate(`/request/${id}`)}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
