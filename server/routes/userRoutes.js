const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");
const { authenticateUser } = require("../middleware/auth");
const ctrl = require("../controllers/userController");

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [client, manager]
 *               personal_details:
 *                 type: string
 *                 nullable: true
 *               experience:
 *                 type: string
 *                 nullable: true
 *               specialization:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Missing fields
 *       500:
 *         description: Server error
 */

router.post("/register", registerUser);
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", loginUser);

//profile
router.get("/me", authenticateUser, ctrl.getProfile);
router.put("/update", authenticateUser, ctrl.updateProfile);

module.exports = router;


