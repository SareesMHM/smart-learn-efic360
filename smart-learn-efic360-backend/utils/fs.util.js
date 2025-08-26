const path = require("path");
const fs = require("fs/promises");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

async function deleteFileIfExists(filename) {
  if (!filename) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
  } catch (_) { /* ignore */ }
}

module.exports = { deleteFileIfExists, UPLOAD_DIR };
