const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  createAssignment,
  listAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

// simple multer (reuse your existing one if you have it)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads", "docs")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// CRUD
router.post("/", upload.single("file"), createAssignment);
router.get("/", listAssignments);
router.get("/:id", getAssignmentById);
router.put("/:id", upload.single("file"), updateAssignment);
router.delete("/:id", deleteAssignment);

module.exports = router;
