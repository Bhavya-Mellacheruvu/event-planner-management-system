import React, { useState } from "react";
import axios from "axios";
import "../styles/Reports.css";
import { jwtDecode } from "jwt-decode";
import Header from "./Header";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function Reports() {
  const token = localStorage.getItem("token");
  const role = token ? jwtDecode(token).role : "";

  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!report) {
      alert("Please select a report");
      return;
    }

    try {
      setLoading(true);

      const res = await api.get(`/api/reports/${report}`, {
        responseType: "blob", // important for CSV files
      });

      // Create a downloadable link
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${report}.csv`;
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(url);
      link.remove();
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to download report");
      setLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <h2 className="reports-title">Reports</h2>

      <div className="reports-card">
        <label className="reports-label">Select Report</label>
        <select
          className="reports-dropdown"
          value={report}
          onChange={(e) => setReport(e.target.value)}
        >
          <option value="">-- Choose Report --</option>

        <option value="event-request-summary">Event Request Summary</option>
        <option value="vendor-utilization">Vendor Utilization Report</option>
        <option value="budget-overview">Budget Overview Report</option>

        </select>

        <button
          className="download-btn"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? "Downloading..." : "Download CSV"}
        </button>
      </div>
    </div>
  );
}
