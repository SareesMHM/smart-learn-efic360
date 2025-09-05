// routes/accessLogs.js
const express = require("express");
const router = express.Router();

const path = require("path");
// robust absolute path, works on Windows too
const { protect, isAdmin } = require("../middlewares/authMiddleware");

const ctrl = require(path.resolve(__dirname, "../controllers/accessLogController.js"));


// Admin-only routes
router.get("/",           protect, isAdmin, ctrl.listLogs);
router.get("/stats",      protect, isAdmin, ctrl.stats);
router.get("/suspicious", protect, isAdmin, ctrl.suspicious);
router.get("/export",     protect, isAdmin, ctrl.exportExcel);

module.exports = router;
