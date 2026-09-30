// This file just maps URLs to the functions that should run for them.
// It doesn't contain the actual logic - that lives in authController.js.

const express = require("express");
const { signup, login } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
