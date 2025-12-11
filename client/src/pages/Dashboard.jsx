import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { jwtDecode } from "jwt-decode";
import Header from "./Header";

const baseURL = "http://localhost:8080";

export default function Dashboard() {
  const [clientRequests, setClientRequests] = useState([]);
  const [managerPending, setManagerPending] = useState([]);
  const [managerAssigned, setManagerAssigned] = useState([]);
  const [authData, setAuthData] = useState({ userId: null, role: null, api: null });
  const [loading, setLoading] = useState(true);

  const { userId, role, api } = authData;

  // ============================
  // AUTH SETUP
  // ============================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        const newApi = axios.create({
          baseURL: baseURL,
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuthData({
          userId: decoded.user_id,
          role: decoded.role.toLowerCase(),
          api: newApi,
        });

      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }

    setLoading(false);
  }, []);

  // ============================
  // CLIENT REQUESTS
  // ============================
  const fetchClientRequests = useCallback(async () => {
    if (!api || !userId) return;
    try {
      const res = await api.get(`/api/event-request/client/${userId}`);
      setClientRequests(res.data);
    } catch (err) {
      console.error(err);
      alert("Could not load your requests");
    }
  }, [api, userId]);

  // ============================
  // MANAGER REQUESTS
  // ============================
  const fetchManagerData = useCallback(async () => {
    if (!api || !userId) return;
    try {
      const pending = await api.get(`/api/event-request/pending`);
      setManagerPending(pending.data);

      const assigned = await api.get(`/api/event-request/manager/${userId}`);
      setManagerAssigned(assigned.data);

    } catch (err) {
      console.error(err);
      alert("Manager request load failed");
    }
  }, [api, userId]);

  // ============================
  // TRIGGER DATA FETCH
  // ============================
  useEffect(() => {
    if (role === "client") fetchClientRequests();
    if (role === "manager") fetchManagerData();
  }, [role, fetchClientRequests, fetchManagerData]);

  // ============================
  // MANAGER ACCEPT / REJECT
  // ============================
  const handleRequestAction = async (request_id, action) => {
    if (!api || !userId) return;

    try {
      await api.put(`/api/event-request/status/${request_id}`, {
        status: action,
        manager_id: userId
      });

      alert(`Request ${action} successfully`);
      fetchManagerData();

    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  if (loading) return <div className="dash-container"><h3>Loading...</h3></div>;

  return (
    <div className="dash-container">
      <Header />

      {/* CLIENT DASHBOARD */}
      {role === "client" && (
        <>
          <h2>My Event Requests</h2>

          <div className="dash-actions">
            <a className="view-btn" href="/client/new-request">
              + Create New Request
            </a>
          </div>

          <RequestTable
            requests={clientRequests}
            role="client"
            api={api}
            fetchClientRequests={fetchClientRequests}
          />
        </>
      )}

      {/* MANAGER DASHBOARD */}
      {role === "manager" && (
        <>
          <h2>Pending Event Requests</h2>

          <RequestTable
            requests={managerPending}
            role="manager-pending"
            onAccept={(id) => handleRequestAction(id, "In-Progress")}
            onReject={(id) => handleRequestAction(id, "Rejected")}
          />

          <h2 style={{ marginTop: "40px" }}>Assigned Event Requests</h2>

          <RequestTable
            requests={managerAssigned}
            role="manager-assigned"
          />
        </>
      )}
    </div>
  );
}

/* ============================
   REUSABLE TABLE COMPONENT
================================ */
function RequestTable({ requests, role, onAccept, onReject, api, fetchClientRequests }) {

  // DELETE (Client Only)
  const handleDeleteRequest = async (request_id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await api.delete(`/api/event-request/deleteRequest/${request_id}`);
      alert(`Request deleted successfully`);

      if (role === "client") fetchClientRequests();
      else window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      alert("Failed to delete request");
    }
  };

  return (
    <table className="dash-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Event Request Name</th>
          <th>Description</th>
          <th>City</th>
          <th>Request Type</th>     {/* NEW COLUMN */}
          <th>Theme</th>
          <th>Budget</th>
          <th>Date</th>

          {role === "manager-assigned" && <th>Client</th>}
          {role === "client" && <th>Manager</th>}

          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {requests.length === 0 ? (
          <tr>
            <td colSpan="11">No records found</td>
          </tr>
        ) : (
          requests.map((r, i) => (
            <tr key={r.request_id}>
              <td>{i + 1}</td>
              <td>{r.event_request_name}</td>
              <td>{r.event_request_desc}</td>
              <td>{r.city}</td>

              {/* Display normalized request type */}
              <td>{r.request_type}</td>

              <td>{r.theme_pref}</td>
              <td>{r.overall_budget}</td>
              <td>{r.event_start_date?.split("T")[0] || "-"}</td>

              {role === "manager-assigned" && <td>{r.client_name}</td>}
              {role === "client" && <td>{r.manager_name || "Not Assigned"}</td>}

              <td>
                <span className={`status status-${r.status?.toLowerCase()}`}>
                  {r.status}
                </span>
              </td>

              <td>
                {/* CLIENT ACTIONS */}
                {(role === "client" || role === "manager-assigned") && (
                  <div className="client-action-buttons">
                    <a className="view-btn" href={`/request/${r.request_id}`}>
                      View
                    </a>

                    {role === "client" && r.status?.toLowerCase() === "pending" && (
                      <button className="delete-btn" onClick={() => handleDeleteRequest(r.request_id)}>
                        Delete
                      </button>
                    )}
                  </div>
                )}

                {/* MANAGER ACTIONS */}
                {role === "manager-pending" && (
                  <div className="manager-buttons">
                    <button className="accept-btn" onClick={() => onAccept(r.request_id)}>
                      Accept
                    </button>
                    <button className="reject-btn" onClick={() => onReject(r.request_id)}>
                      Reject
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
