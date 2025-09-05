// utils/logAccess.js
const AccessLog = require("../models/AccessLog");

function getIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    ""
  );
}

/**
 * Record an access log (never throws; returns doc or null).
 * Examples:
 *   await logAccess(req, { action: "login", success: true, userId, role });
 *   await logAccess(req, { action: "login", success: false, meta: { emailTried } });
 */
async function logAccess(req, { userId, role, action, success, meta } = {}) {
  try {
    const doc = await AccessLog.create({
      userId,
      role,
      action: action || "login",
      success,
      ip: getIp(req),
      userAgent: req.headers["user-agent"],
      meta,
      timestamp: new Date(),
    });
    return doc;
  } catch (err) {
    console.error("AccessLog error:", err.message);
    return null;
  }
}

module.exports = { logAccess, getIp };
