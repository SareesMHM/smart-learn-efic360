const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
const VIDEO_TYPES = new Set([
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
  "video/x-msvideo", "video/x-matroska",
]);
const PDF_TYPES = new Set(["application/pdf"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (VIDEO_TYPES.has(file.mimetype) || PDF_TYPES.has(file.mimetype)) return cb(null, true);
  return cb(new Error("Unsupported file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

module.exports = { upload };
