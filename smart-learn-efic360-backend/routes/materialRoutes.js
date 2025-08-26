// routes/materialRoutes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const {
  uploadMaterial,   // POST handler
  getMaterials,     // GET handler
  deleteMaterial,   // DELETE handler
} = require("../controllers/materialController");

const router = express.Router();

/* -------------------- Upload config -------------------- */
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");
const DIRS = {
  videos: path.join(UPLOAD_ROOT, "videos"),
  docs: path.join(UPLOAD_ROOT, "docs"),
  misc: path.join(UPLOAD_ROOT, "misc"),
};

Object.values(DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Allowed mime types
const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",     // .mov
  "video/x-msvideo",     // .avi
  "video/x-matroska",    // .mkv
]);
const PDF_TYPES = new Set(["application/pdf"]);

// Decide subfolder by mimetype
function destByMime(mime) {
  if (VIDEO_TYPES.has(mime)) return DIRS.videos;
  if (PDF_TYPES.has(mime)) return DIRS.docs;
  return DIRS.misc;
}

// Safe-ish filename (timestamp + original, spaces -> underscores)
function safeName(original) {
  const ts = Date.now();
  const clean = (original || "file")
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_");
  return `${ts}-${clean}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destByMime(file.mimetype)),
  filename: (req, file, cb) => cb(null, safeName(file.originalname)),
});

const fileFilter = (_req, file, cb) => {
  // Allow videos & pdfs; reject others
  if (VIDEO_TYPES.has(file.mimetype) || PDF_TYPES.has(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type. Only video and PDF files are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

/* -------------------- Routes -------------------- */
// Create / Update material (file optional; Multer only runs if a file is sent)
router.post("/materials", upload.single("file"), uploadMaterial);

// List materials
router.get("/materials", getMaterials);

// Delete material
router.delete("/materials/:id", deleteMaterial);

module.exports = router;
