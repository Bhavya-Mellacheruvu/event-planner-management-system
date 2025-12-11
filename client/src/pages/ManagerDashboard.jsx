import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Manager.css";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([]);

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const managerId = decoded.user_id;

  useEffect(() => {
    loadAssignedRequests();
  }, []);

  const loadAssignedRequests = async () => {
    try {
      const res = await api.get(`/api/event-request/manager/${managerId}`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load assigned requests");
    }
  };

  return (
    <div className="manager-page">
      <h2>Manager Dashboard</h2>

      <table className="manager-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Client</th>
            <th>City</th>
            <th>Theme</th>
            <th>Budget</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 && (
            <tr><td colSpan="7">No assigned requests</td></tr>
          )}

          {requests.map((r) => (
            <tr key={r.request_id}>
              <td>{r.request_id}</td>
              <td>{r.client_name}</td>
              <td>{r.city}</td>
              <td>{r.theme_pref}</td>
              <td>{r.overall_budget}</td>
              <td>
                <span className={`status status-${r.status.toLowerCase()}`}>
                  {r.status}
                </span>
              </td>
              <td>
                <a href={`/manager/request/${r.request_id}`} className="view-btn">
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
