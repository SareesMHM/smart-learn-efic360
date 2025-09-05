// routes/assignmentRoutes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");

const { Content } = require("../models/materialModel");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const { requireAuth } = require("../utils/auth");

const {
  createAssignment,
  listAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* -------------------- Upload config -------------------- */
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");
const SUBMISSIONS_DIR = path.join(UPLOAD_ROOT, "submissions");
const DOCS_DIR = path.join(UPLOAD_ROOT, "docs");

// Ensure dirs exist
fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
fs.mkdirSync(DOCS_DIR, { recursive: true });

// PDF only (adjust if needed)
const ALLOWED_MIME = new Set(["application/pdf"]);

// Safe-ish filename
function safeName(original) {
  const ts = Date.now();
  const clean = String(original || "file")
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_");
  return `${ts}_${clean}`;
}

/* Submissions storage (students upload PDFs) */
const submissionsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SUBMISSIONS_DIR),
  filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
});
const submissionsFilter = (_req, file, cb) =>
  ALLOWED_MIME.has(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only PDF files are allowed for submissions."));
const uploadSubmission = multer({
  storage: submissionsStorage,
  fileFilter: submissionsFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* Admin/teacher assignment file storage (optional) */
const docsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DOCS_DIR),
  filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
});
const docsFilter = (_req, file, cb) =>
  ALLOWED_MIME.has(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Unsupported file type. Only PDF files are allowed."));
const uploadDoc = multer({
  storage: docsStorage,
  fileFilter: docsFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/* ----------------- helpers ----------------- */
async function loadAssignment(req, res, next) {
  const { assignmentId } = req.params;
  if (!isValidObjectId(assignmentId)) {
    return res.status(400).json({ message: "Invalid assignmentId." });
  }
  const doc = await Content.findById(assignmentId).lean();
  if (!doc || doc.type !== "assignment") {
    return res.status(404).json({ message: "Assignment not found." });
  }
  req.assignment = doc;
  next();
}

/* ----------------- Student submission ----------------- */
// POST /api/assignment/:assignmentId/submit
router.post(
  "/assignment/:assignmentId/submit",
  requireAuth,
  loadAssignment,
  uploadSubmission.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded (expecting field 'file')." });
    }

    // Optional due-date check
    const due = req.assignment?.meta?.dueDate ? new Date(req.assignment.meta.dueDate) : null;
    const isLate = due && !Number.isNaN(due.getTime()) && new Date() > due;

    // Build relative path under /uploads
    const relFromUploads = path.relative(UPLOAD_ROOT, req.file.path).replace(/\\/g, "/");

    // If your model uses files[], store into the array:
    const sub = await AssignmentSubmission.create({
      assignment: req.assignment._id,
      student: req.user._id,
      files: [
        {
          path: relFromUploads.startsWith("submissions/")
            ? relFromUploads
            : `submissions/${path.basename(req.file.path)}`,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      ],
      subject: req.assignment.subject,
      gradeLevel: req.assignment.grade,
      dueDate: due || undefined,
      isLate: Boolean(isLate),
      status: "submitted",
    });

    return res.status(201).json({
      message: "Submitted",
      submissionId: sub._id,
      fileUrl: `/uploads/${sub.files?.[0]?.path || relFromUploads}`, // you serve /uploads statically
      isLate,
    });
  }
);

/* ----------------- Assignment CRUD (admin/teacher) ----------------- */
// Mount these under /api/assignments
router.post("/assignments", uploadDoc.single("file"), createAssignment);
router.get("/assignments", listAssignments);
router.get("/assignments/:id", getAssignmentById);
router.put("/assignments/:id", uploadDoc.single("file"), updateAssignment);
router.delete("/assignments/:id", deleteAssignment);

/* -------- Multer error -> JSON -------- */
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || /Only PDF files/.test(err.message) || /Unsupported file type/.test(err.message)) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: "Upload error", error: err.message });
});

module.exports = router;
