// routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.post(
  '/register',
  registrationController.uploadFiles,
  registrationController.register
);

module.exports = router;
