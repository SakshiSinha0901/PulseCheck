// This is the starting point of our backend server.
// Right now it just proves the server can turn on and respond - Phase 1 will add real routes.

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// A simple "is the server alive" check - visit http://localhost:5000/ to test it.
app.get("/", (req, res) => {
  res.json({ message: "PulseCheck backend is running." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PulseCheck backend listening on port ${PORT}`);
});
