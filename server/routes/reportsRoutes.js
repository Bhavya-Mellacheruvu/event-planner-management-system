// reportsRoutes.js (Apply this fix)
const router = require("express").Router();
const ctrl = require("../controllers/ReportsController");

// This tells Express to treat whatever comes after /api/reports/ as the 'report' parameter
router.get("/:report", ctrl.getReport); 

module.exports = router;