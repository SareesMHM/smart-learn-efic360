// utils/jwtHelper.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in the token (e.g., user id, role)
 * @param {string} expiresIn - Token expiration time (e.g., '1d', '2h')
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = '1d') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token string
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
