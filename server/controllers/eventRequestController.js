const db = require("../config/db_connection");
const moment = require('moment');

exports.createRequest = async (req, res) => {
  try {
    const { 
      event_name, 
      event_desc, 
      city, 
      theme, 
      budget, 
      request_type_id,   // UPDATED
      event_start_date, 
      guest_count, 
      notes 
    } = req.body;

    let client_id = req.user.user_id;

    if (!client_id || !city || !theme || !budget || !request_type_id) {
      return res.status(400).json({
        error: "Missing required fields: client_id, city, theme, budget, request_type_id"
      });
    }

    if (budget <= 0) {
      return res.status(400).json({ error: "Budget must be greater than zero" });
    }

    if (event_start_date && moment(event_start_date).isBefore(moment())) {
      return res.status(400).json({ error: "Event date must be in the future" });
    }

    await db.query(
      "CALL sp_create_event_request(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        client_id,
        event_name,
        event_desc,
        city,
         theme,
        budget,
        request_type_id, 
        event_start_date,
        guest_count,
        notes
      ]
    );

    res.json({ message: "Event request created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestsByClient = async (req, res) => {
  try {
    const client_id = req.params.client_id;

    const [requests] = await db.query(
      "CALL sp_get_requests_by_client(?)",
      [client_id]
    );

    res.json(requests[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query(
      "SELECT er.*,r.request_type FROM event_request er NATURAL JOIN request_type r WHERE request_id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Request not found" });

    return res.json(rows[0]);

  } catch (err) {
    console.error("ERROR getRequestById:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateRequest = async (req, res) => {
  const { id } = req.params;

  const {
    event_request_name,
    event_request_desc,
    city,
    request_type_id,   // UPDATED
    theme_pref,
    guest_count,
    overall_budget,
    notes,
    event_start_date
  } = req.body;

  try {
    const [rows] = await db.query(`CALL sp_get_request_by_id(?)`, [id]);
    const request = rows[0][0];

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Only pending requests can be edited" });
    }

    await db.query(
      `CALL sp_update_event_request(?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        event_request_name,
        event_request_desc,
        city,
        request_type_id,  // UPDATED
        theme_pref,
        guest_count,
        overall_budget,
        notes,
        event_start_date || null
      ]
    );

    res.json({ message: "Request updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err });
  }
};


exports.getPendingRequests = async (req, res) => {
  try {
    const [requests] = await db.query("CALL sp_get_pending_requests()");
    res.json(requests[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRequest = async(req,res) => {
  try {
    const request_id = req.params.request_id;
    await db.query("CALL sp_delete_request(?)",[request_id]);

    res.status(200).json({ 
        message: `Event request successfully deleted.` 
    });
  } catch(err){
    res.status(500).json({error:err.message});
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const request_id = req.params.id;
    const { status, manager_id } = req.body;

    const [result] = await db.query(
      "CALL sp_update_event_status(?, ?, ?)",
      [request_id, status, manager_id]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequestsByManager = async (req, res) => {
  try {
    const { manager_id } = req.params;

    const [results] = await db.query(
      "CALL sp_get_requests_by_manager(?)",
      [manager_id]
    );

    // results[0] contains ROWS returned by the SELECT
    res.json(results[0]);

  } catch (err) {
    console.error("Manager Request Fetch Error:", err);
    res.status(500).json({ error: "Server error fetching manager requests" });
  }
};

exports.getRequestTypes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT request_type_id, request_type FROM request_type ORDER BY request_type");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching request types:", err);
    res.status(500).json({ error: "Failed to fetch request types" });
  }
};




