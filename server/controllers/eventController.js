const db = require("../config/db_connection");


function deriveEventStatus(allocationList) {
  if (allocationList.length === 0) return "Not Assigned";

  const statuses = allocationList.map(a => a.status);

  if (statuses.every(s => s === "Completed")) return "Completed";
  if (statuses.some(s => s === "In Progress")) return "In Progress";

  return "Assigned";
}

// GET all events under a request
exports.getEventsByRequest = async (req, res) => {
  const request_id = req.params.request_id;
  try {
    const [events] = await db.query(`CALL sp_get_events_by_request(?)`, [request_id]);
    res.json(events[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to load events" });
  }
};


// CREATE event
exports.createEvent = async (req, res) => {
  const {
    request_id,
    event_type,
    event_description,
    venue,
    guest_count,
    start_date,
    approved_budget
  } = req.body;

  try {
    // 1️⃣ Fetch the parent request
    const [reqRows] = await db.query(
      "SELECT overall_budget, event_start_date FROM event_request WHERE request_id = ?",
      [request_id]
    );

    if (!reqRows.length) {
      return res.status(404).json({ error: "Request not found" });
    }

    const request = reqRows[0];
    const reqBudget = Number(request.overall_budget); // cast to number
    const eventBudget = Number(approved_budget);      // cast to number

    // // debug
    // console.log("REQ BUDGET:", reqBudget);
    // console.log("NEW EVENT BUDGET:", eventBudget);

    // 2️⃣ VALIDATION: Event date >= request event_start_date
    if (new Date(start_date) < new Date(request.event_start_date)) {
      return res.status(400).json({
        error: "Event date cannot be before the request's preferred start date"
      });
    }

    // 3️⃣ VALIDATION: Sum(event budgets)
    const [eventSumRows] = await db.query(
      "SELECT COALESCE(SUM(approved_budget), 0) AS sum_budget FROM event WHERE request_id = ?",
      [request_id]
    );

    const usedBudget = Number(eventSumRows[0].sum_budget); // cast to number

    console.log("USED BUDGET:", usedBudget);

    // 4️⃣ Compare remaining amount
    if (usedBudget + eventBudget > reqBudget) {
      const remaining = reqBudget - usedBudget;

      return res.status(400).json({
        error: `Total event budgets exceed the request's budget. You can allocate only up to: ${remaining}`
      });
    }

    // 5️⃣ CREATE EVENT
    const [result] = await db.query(
      `CALL sp_create_event(?,?,?,?,?,?,?)`,
      [request_id, event_type, event_description, venue, guest_count, start_date, eventBudget]
    );

    return res.json({
      message: "Event created successfully",
      event_id: result[0][0].event_id
    });

  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

//-------------------------------------------------------
// ASSIGN VENDOR (WITH BUSINESS LOGIC CHECK: CONTRACT AMT)
//-------------------------------------------------------

exports.getAllocationsByEvent = async (req, res) => {
  const { event_id } = req.params;

  try {
    const [alloc] = await db.query(`CALL sp_get_allocations(?)`, [event_id]);

    const event_status = deriveEventStatus(alloc[0]);

    res.json({
      status: event_status,
      allocations: alloc[0]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch allocations" });
  }
};

// ==========================
// GET all vendors
// ==========================
exports.getVendors = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_get_vendors()");
    res.json(rows[0]); // resultset
  } catch (err) {
    console.error("getVendors:", err);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
};

// ==========================
// GET vendor by ID
// ==========================
exports.getVendorById = async (req, res) => {
  const vendor_id = req.params.vendor_id;
  try {
    const [rows] = await db.query("CALL sp_get_vendor_by_id(?)", [vendor_id]);
    const vendor = rows[0][0] || null;

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (err) {
    console.error("getVendorById:", err);
    res.status(500).json({ error: "Failed to fetch vendor details" });
  }
};
exports.assignVendor = async (req, res) => {
  const { event_id, vendor_id, contract_amount } = req.body;

  if (!event_id || !vendor_id) {
    return res.status(400).json({ error: "event_id and vendor_id are required" });
  }

  try {
    // 1️⃣ Fetch event budget
    const [eventRows] = await db.query(
      "SELECT approved_budget FROM event WHERE event_id = ?",
      [event_id]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const approvedBudget = Number(eventRows[0].approved_budget);

    // 2️⃣ Fetch current vendor allocations
    const [allocRows] = await db.query(
      "SELECT COALESCE(SUM(contract_amount), 0) AS allocated_sum FROM allocation WHERE event_id = ?",
      [event_id]
    );

    const allocatedSoFar = Number(allocRows[0].allocated_sum);
    const newContractAmount = Number(contract_amount);

    // DEBUG LOGS
    console.log("APPROVED BUDGET:", approvedBudget);
    console.log("ALLOCATED SO FAR:", allocatedSoFar);
    console.log("NEW CONTRACT:", newContractAmount);

    // 3️⃣ VALIDATION check
    if (allocatedSoFar + newContractAmount > approvedBudget) {
      const remaining = approvedBudget - allocatedSoFar;
      return res.status(400).json({
        error: `Vendor allocation exceeds event budget. Remaining allowed: ${remaining}`
      });
    }

    // 4️⃣ Assign vendor
    const [rows] = await db.query(
      "CALL sp_allocate_vendor_to_event(?,?,?)",
      [event_id, vendor_id, newContractAmount]
    );

    return res.json({
      message: "Vendor assigned successfully",
      allocation: rows[0][0]
    });

  } catch (err) {
    console.error("assignVendor:", err);
    return res.status(500).json({ error: "Failed to assign vendor" });
  }
};

// ==========================
// DELETE event by ID
// ==========================
exports.deleteEvent = async (req, res) => {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ error: "event_id is required" });
    }

    // Call stored procedure to delete event
    const [result] = await db.query("CALL sp_delete_event(?)", [event_id]);

    res.json({ message: "Event deleted successfully" });

  } catch (err) {
    console.error("deleteEvent:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};






