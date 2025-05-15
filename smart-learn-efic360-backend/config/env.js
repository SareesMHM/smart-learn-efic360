// config/env.js
require('dotenv').config();

const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} is missing.`);
    process.exit(1);
  }
});

module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
