const router = require("express").Router();
const ctrl = require("../controllers/eventController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");


router.post("/create", authenticateUser, authorizeRoles("manager"), ctrl.createEvent);

router.get("/request/:request_id", authenticateUser, ctrl.getEventsByRequest);

router.post("/allocate", authenticateUser, authorizeRoles("manager"), ctrl.assignVendor);

router.get("/allocations/:event_id", authenticateUser, ctrl.getAllocationsByEvent);

router.get("/vendors/:vendor_id", authenticateUser, authorizeRoles("manager"), ctrl.getVendorById);

router.get("/vendors", authenticateUser, authorizeRoles("manager"), ctrl.getVendors);

router.delete("/:event_id", ctrl.deleteEvent);

module.exports = router;
