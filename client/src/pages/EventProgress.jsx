// client/src/pages/EventProgress.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Client.css";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

const steps = ["Pending", "In-Progress", "Scheduled", "Completed"];

export default function EventProgress({ match, params }) {
  const requestId = params?.id || (match && match.params && match.params.id) || window.location.pathname.split("/").pop();
  const [request, setRequest] = useState(null);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      const res = await api.get(`/api/event-request/${requestId}`);
      setRequest(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load progress");
    }
  };

  if (!request) return <div className="client-page">Loading...</div>;

  const current = steps.indexOf(request.status || "Pending");

  return (
    <div className="client-page">
      <h2>Event Progress — Request #{request.request_id}</h2>

      <div className="progress-track">
        {steps.map((s, idx) => (
          <div key={s} className={`progress-step ${idx <= current ? "done" : ""}`}>
            <div className="step-circle">{idx + 1}</div>
            <div className="step-label">{s}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Current Status:</strong> <span className={`status status-${request.status?.toLowerCase()}`}>{request.status}</span>
      </div>
    </div>
  );
}
