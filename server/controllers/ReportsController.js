const json2csv = require("json2csv").parse;
const db = require('../config/db_connection'); 

exports.getReport = async (req, res) => {
  const report = req.params.report;

  let query = "";
  
  // 1. Determine the SQL query based on the report parameter
  if (report === "event-request-summary") {
    query = "SELECT * FROM vw_event_request_summary";
  } else if (report === "vendor-utilization") {
    query = "SELECT * FROM vw_vendor_utilization";
  } else if (report === "budget-overview") {
    query = "SELECT * FROM vw_budget_overview";
  } else {
    // 2. Handle 404 for unknown reports before the database call
    return res.status(404).json({ error: "Report not found" });
  }

  try {
    // 3. Execute the database query
    // The db.query often returns an array of [rows, fields]. We destructure for rows.
    const [rows] = await db.query(query);

    // 4. Convert the database rows (JSON array) into a CSV string
    const csv = json2csv(rows);
    
    // 5. Set response headers for CSV download
    res.header("Content-Type", "text/csv");
    res.attachment(`${report}.csv`);
    
    // 6. Send the CSV data back to the client
    return res.send(csv);

  } catch (error) {
    // 7. Log and handle any database or CSV conversion errors
    console.error(`Error generating report '${report}':`, error);
    return res.status(500).json({ error: `Failed to generate report: ${report}. Internal Server Error.` }); 
  }
};