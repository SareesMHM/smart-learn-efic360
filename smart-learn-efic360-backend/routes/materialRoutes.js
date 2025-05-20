// routes/materialRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadMaterial, getMaterials, deleteMaterial } = require('../controllers/materialController');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Routes
router.post('/', upload.single('file'), uploadMaterial);
router.get('/', getMaterials);
router.delete('/:id', deleteMaterial);

module.exports = router;
