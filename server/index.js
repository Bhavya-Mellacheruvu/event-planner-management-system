const express = require("express");
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require("./swagger");

//const db = require("./config/db_connection");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRequestRoutes");
const events = require("./routes/eventsRoutes");
const reports = require("./routes/reportsRoutes");
const app = express();
app.use(express.json());

const corsOptions = {
  // Replace 'http://localhost:3000' with your actual frontend URL in production
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowable methods
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/users", userRoutes);
app.use("/api/event-request", eventRoutes);
app.use("/api/events", events);
app.use("/api/reports",reports);
app.listen(8080, () => console.log("Server running on port 8080"));
