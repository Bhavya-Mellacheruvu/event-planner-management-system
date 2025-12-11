// server/routes/eventRequestRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/eventRequestController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.get("/request-types", ctrl.getRequestTypes);

// CLIENT ROUTES
router.post("/create", authenticateUser, authorizeRoles("client"), ctrl.createRequest);
router.get("/client/:client_id", authenticateUser, authorizeRoles("client"), ctrl.getRequestsByClient);
router.delete("/deleteRequest/:request_id",authenticateUser, authorizeRoles("client"), ctrl.deleteRequest);

// MANAGER ROUTES
router.get("/pending", authenticateUser, authorizeRoles("manager"), ctrl.getPendingRequests);

router.get("/manager/:manager_id", authenticateUser, authorizeRoles("manager"), ctrl.getRequestsByManager);

// STATUS UPDATE
router.put("/status/:id", authenticateUser, ctrl.updateStatus);


router.get("/:id", authenticateUser, ctrl.getRequestById);
router.put("/:id", authenticateUser, authorizeRoles("client"), ctrl.updateRequest);

module.exports = router;
