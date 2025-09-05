// middleware/logAccess.js
const AccessLog = require("../models/AccessLog");

// works behind proxies too
const getIp = (req) =>
  (req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.ip ||
    req.connection?.remoteAddress ||
    "").trim();

/**
 * Usage:
 *   router.post("/login", verifyUser, logAccess("login"), issueToken)
 *   router.post("/logout", auth, logAccess("logout"), handler)
 */
const logAccess = (action, opts = {}) => async (req, res, next) => {
  try {
    if (req.user) {
      await AccessLog.create({
        userId: req.user._id,
        role: req.user.role,            // must be one of the enum values
        ip: getIp(req),
        userAgent: req.headers["user-agent"],
        action,
        meta: typeof opts.metaBuilder === "function" ? opts.metaBuilder(req) : undefined,
      });
    }
  } catch (err) {
    // don't block the request if logging fails
    console.error("AccessLog error:", err.message);
  } finally {
    next();
  }
};

module.exports = { logAccess, getIp };
