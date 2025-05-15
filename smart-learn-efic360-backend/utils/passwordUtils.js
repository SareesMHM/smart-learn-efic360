// utils/passwordUtils.js
const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password
 * @param {string} plainPassword
 * @returns {Promise<string>} hashed password
 */
async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(plainPassword, salt);
  return hashed;
}

/**
 * Compare plain password with hashed password
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} true if match
 */
async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword,
};
