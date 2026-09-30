// This is the starting point of our backend server.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const siteRoutes = require("./routes/siteRoutes");
const { startCheckerJob } = require("./jobs/checkerJob");

const app = express();

app.use(cors());
app.use(express.json());

// A simple "is the server alive" check - visit http://localhost:5000/ to test it.
app.get("/", (req, res) => {
  res.json({ message: "PulseCheck backend is running." });
});

// Any URL starting with /api/auth (like /api/auth/signup) goes to authRoutes.js
app.use("/api/auth", authRoutes);

// Any URL starting with /api/sites goes to siteRoutes.js (all protected by login)
app.use("/api/sites", siteRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PulseCheck backend listening on port ${PORT}`);
  startCheckerJob(); // start the background website-checking job once the server is up
});
