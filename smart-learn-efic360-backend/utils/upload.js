const multer = require("multer");
const path=require("path");
const fs=require("fs");

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'users');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const dateSuffix = Date.now();
      const originalName = file.originalname.replace(/\s/g, '_');
      const newName = `${dateSuffix}-${originalName}`;
      cb(null, newName);
    },
  }),
});

module.exports = upload;