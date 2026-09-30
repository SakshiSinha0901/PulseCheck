// Maps URLs to their functions. Every route here first passes through "protect",
// meaning: no valid login token = request gets blocked before it even reaches
// the real logic in siteController.js.

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { addSite, getSites, deleteSite, getSiteStats } = require("../controllers/siteController");

const router = express.Router();

router.post("/", protect, addSite);
router.get("/", protect, getSites);
router.delete("/:id", protect, deleteSite);
router.get("/:id/stats", protect, getSiteStats);

module.exports = router;
