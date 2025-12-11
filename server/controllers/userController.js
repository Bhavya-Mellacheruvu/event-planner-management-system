const bcrypt = require("bcrypt");
const db = require("../config/db_connection");  
var jwt = require('jsonwebtoken');

// REGISTER USER CONTROLLER
exports.registerUser = async (req, res) => {
  const {
    email,
    name,
    password,
    phone_number,
    role,
    personal_details,
    experience,
    specialization
  } = req.body;

  // Basic validation
  if (!email || !name || !password || !role) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!["client", "manager"].includes(role)) {
    return res.status(400).json({ error: "Invalid role provided." });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Call stored procedure
    const [result] = await db.query(
      "CALL sp_register_user(?, ?, ?, ?, ?, ?, ?,?)",
      [
        email,
        name,
        hashedPassword,
        phone_number,
        role,
        personal_details || null,
        experience || null,
        specialization || null
      ]
    );

    const user_id = result[0]?.user_id;

    return res.status(201).json({
      message: "User registered successfully",
      user_id
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      error: "Server error during registration",
      details: error.message
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call stored procedure
    const [results] = await db.query(`CALL sp_get_user_by_email(?)`, [email]);

    // Stored procedures return nested arrays in mysql2
    const user = results[0][0];

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({ token, role: user.role });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET logged-in user's profile
// controllers/userController.js
exports.getProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // CALL Stored Procedure
        const [results] = await db.query(`CALL sp_get_user_by_id(?)`, [user_id]);

        // results[0] = base user row
        // results[1] = either client or manager details
        const base = results[0]?.[0] || {};
        const extra = results[1]?.[0] || {};

        const profile = {
            user_id: base.user_id,
            name: base.name,
            email: base.email,
            phone_number: base.phone_number || null,
            role: base.role,

            // flexible fields
            personal_details: extra.personal_details || null,
            experience: extra.experience || null,
            specialization: extra.specialization || null
        };

        res.json(profile);

    } catch (err) {
        console.error("PROFILE ERROR:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};


// UPDATE profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { name, email, password, phone_number, personal_details, experience, specialization } = req.body;

  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const query = `CALL sp_update_user(?,?,?,?,?,?,?,?)`;
  const params = [
    userId,
    name || null,
    email || null,
    hashedPassword,
    phone_number,
    personal_details || null,
    experience || null,
    specialization || null
  ];

  db.query(query, params)
    .then(() => res.json({ message: "Profile updated successfully" }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Profile update failed" });
    });
};
