// client/src/pages/EventRequestDetails.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/EventRequestDetails.css";
import Header from "./Header";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function EventRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [contractAmount, setContractAmount] = useState("");

  const token = localStorage.getItem("token");
  const role = token ? jwtDecode(token).role : "";

  useEffect(() => {
    fetchRequest();
    fetchEventsAndAllocations();
    fetchVendorList();
  }, []);

  // 🔥 ALWAYS RUN AUTO-STATUS CHECK WHEN ANY RELEVANT STATE CHANGES
  useEffect(() => {
    if (request) {
      updateRequestStatusAutomatically(request, events, allocations);
    }
  }, [request, events, allocations]);

  // =============================
  // Fetch Request
  // =============================
  const fetchRequest = async () => {
    try {
      const res = await api.get(`/api/event-request/${id}`);
      setRequest(res.data);
    } catch (err) {
      console.error("fetchRequest:", err);
    }
  };

  // =============================
  // Fetch Events + Allocations
  // =============================
  const fetchEventsAndAllocations = async () => {
    try {
      const res = await api.get(`/api/events/request/${id}`);
      const evs = res.data || [];
      setEvents(evs);

      if (evs.length === 0) {
        setAllocations({});
        return;
      }

      const promises = evs.map((ev) =>
        api
          .get(`/api/events/allocations/${ev.event_id}`)
          .then((r) => ({ id: ev.event_id, data: r.data }))
          .catch(() => ({ id: ev.event_id, data: [] }))
      );

      const results = await Promise.all(promises);

      const allocMap = {};
      results.forEach((r) => {
        allocMap[r.id] = Array.isArray(r.data.allocations)
          ? r.data.allocations
          : [];
      });

      setAllocations(allocMap);
    } catch (err) {
      console.error("fetchEventsAndAllocations:", err);
    }
  };

  // =============================
  // Fetch Vendors
  // =============================
  const fetchVendorList = async () => {
    try {
      const res = await api.get("/api/events/vendors");
      setVendors(res.data || []);
    } catch (err) {
      console.error("fetchVendorList:", err);
    }
  };

  // =============================
  // Load Allocations for Single Event
  // =============================
  const loadAllocations = async (event_id) => {
    try {
      const res = await api.get(`/api/events/allocations/${event_id}`);
      const allocs = Array.isArray(res.data.allocations)
        ? res.data.allocations
        : [];

      setAllocations((prev) => ({
        ...prev,
        [event_id]: allocs,
      }));
    } catch (err) {
      console.error("loadAllocations:", err);
    }
  };

  const toggleDropdown = async (event_id) => {
    if (openDropdown === event_id) {
      setOpenDropdown(null);
      return;
    }

    await loadAllocations(event_id);
    setOpenDropdown(event_id);
  };

  // =============================
  // Assign Vendor
  // =============================
  const openAssignVendor = (event) => {
    setCurrentEvent(event);
    setSelectedVendor("");
    setContractAmount("");
    setShowModal(true);
  };

  const assignVendor = async (vendor_id, amount) => {
    if (!vendor_id) return alert("Please select a vendor");
    if (!amount || Number(amount) <= 0)
      return alert("Please enter a valid contract amount");

    try {
      await api.post("/api/events/allocate", {
        event_id: currentEvent.event_id,
        vendor_id,
        contract_amount: amount,
        request_id: id,
      });

      setSelectedVendor("");
      setContractAmount("");
      setShowModal(false);
      setOpenDropdown(null);

      await fetchEventsAndAllocations();
      await fetchRequest();
    } catch (err) {
      const message = err.response?.data?.error || "Failed to create event.";
      alert(message);
    }
  };

  // =============================
  // Delete Event
  // =============================
  const handleDeleteEvent = async (event_id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/api/events/${event_id}`);

      alert("Event deleted successfully");

      await fetchEventsAndAllocations();
      await fetchRequest();
    } catch (err) {
      console.error("deleteEvent:", err);
      alert("Failed to delete event");
    }
  };

  // =============================
  // Update Status (Server)
  // =============================
  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/api/event-request/status/${id}`, {
        status: newStatus,
        manager_id: request?.manager_id || null,
      });

      await fetchRequest();
    } catch (err) {
      console.error("updateStatus:", err);
    }
  };

  // =============================
  // Auto-Status Logic
  // =============================
  const updateRequestStatusAutomatically = async (req, evs, allocMap) => {
    const allAssigned =
      evs.length > 0 &&
      evs.every((ev) => (allocMap[ev.event_id] || []).length > 0);

    const eventDate = new Date(req.event_start_date);
    const now = new Date();

    if (req.status === "Scheduled" && !allAssigned) {
      await updateStatus("In-Progress");
      return;
    }

    if (req.status === "In-Progress" && allAssigned) {
      await updateStatus("Scheduled");
      return;
    }

    if (req.status === "Scheduled" && eventDate < now) {
      await updateStatus("Completed");
      return;
    }
  };

  // =============================
  // Delete Entire Request
  // =============================
  const handleDeleteRequest = async (request_id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      await api.delete(`/api/event-request/deleteRequest/${request_id}`);
      alert(`Request deleted`);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to delete request");
    }
  };

  if (!request)
    return (
      <div className="erd-container">
        <p>Loading request...</p>
      </div>
    );

  // =============================
  // RENDER UI
  // =============================
  return (
    <div className="erd-wrapper">
      <Header />
      <div className="erd-topbar">
        <h1 className="erd-title">Event Request Details</h1>
        <button className="erd-back-btn" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      {/* Request Info */}
      <div className="erd-request-card">
        <div className="erd-request-grid">
          <p><strong>Event Request Name:</strong> {request.event_request_name}</p>
          <p><strong>Event Request Description:</strong> {request.event_request_desc}</p>
          <p><strong>Request Type:</strong> {request.request_type}</p>
          <p><strong>City:</strong> {request.city}</p>
          <p><strong>Theme:</strong> {request.theme_pref}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-badge status-${request.status?.toLowerCase()}`}>
              {request.status}
            </span>
          </p>
          <p><strong>Preferred Date:</strong> {new Date(request.event_start_date).toLocaleString()}</p>
        </div>

        {role === "manager" &&
          (request.status === "In-Progress" || request.status === "Scheduled") && (
            <button
              className="erd-add-btn"
              onClick={() => navigate(`/manager/create-event/${id}`)}
            >
              + Add Event
            </button>
          )}

        {role === "client" && request.status === "Pending" && (
          <div className="buttons-container">
            <button
              className="erd-btn erd-add-btn"
              onClick={() => navigate(`/client/edit-request/${id}`)}
            >
              Edit Request
            </button>

            <button
              className="erd-btn erd-delete-btn"
              type="button"
              onClick={() => handleDeleteRequest(id)}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Events Table */}
      <h2 className="erd-section-title">Events Under This Request</h2>

      <div className="erd-table-container">
        <table className="erd-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Type</th>
              <th>Description</th>
              <th>Venue</th>
              <th>Guests</th>
              <th>Budget</th>
              <th>Start</th>
              <th>Vendors</th>
              {role === "manager" && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="8" className="erd-empty">No events created.</td>
              </tr>
            ) : (
              events.map((ev, i) => {
                const evAllocs = allocations[ev.event_id] || [];
                const hasVendors = evAllocs.length > 0;

                return (
                  <tr key={ev.event_id}>
                    <td>{i + 1}</td>
                    <td>{ev.event_type}</td>
                    <td>{ev.event_description}</td>
                    <td>{ev.venue}</td>
                    <td>{ev.guest_count}</td>
                    <td>{ev.approved_budget}</td>
                    <td>{new Date(ev.start_date).toLocaleString()}</td>

                    <td>
                      {!hasVendors ? (
                        <span className="no-vendors">No vendors assigned</span>
                      ) : (
                        <>
                          <button
                            className="ellipsis-btn"
                            onClick={() => toggleDropdown(ev.event_id)}
                          >
                            ⋮
                          </button>

                          {openDropdown === ev.event_id && (
                            <div className="dropdown">
                              {evAllocs.map((a) => (
                                <p key={a.allocation_id}>
                                  {a.vendor_name} — ${a.contract_amount}
                                </p>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    {role === "manager" && (
                      <td className="event-action-buttons">
                        <button
                          className="assign-btn"
                          onClick={() => openAssignVendor(ev)}
                        >
                          Assign
                        </button>

                        <button
                          className="delete-event-btn"
                          onClick={() => handleDeleteEvent(ev.event_id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && currentEvent && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h2>Assign Vendor</h2>
            <p className="modal-subtitle">
              Event #{currentEvent.event_id} — {currentEvent.event_type}
            </p>

            <label>Select Vendor</label>
            <select
              className="vendor-dropdown"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              <option value="">-- Select Vendor --</option>
              {vendors.map((v) => (
                <option key={v.vendor_id} value={v.vendor_id}>
                  {v.vendor_name} — {v.service}
                </option>
              ))}
            </select>

            <label>Contract Amount</label>
            <input
              type="number"
              className="amount-input"
              value={contractAmount}
              onChange={(e) => setContractAmount(e.target.value)}
            />

            <button
              className="assign-submit"
              onClick={() => assignVendor(selectedVendor, contractAmount)}
            >
              Assign Vendor
            </button>

            <button className="modal-close" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
