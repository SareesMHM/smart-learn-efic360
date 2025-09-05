// utils/auth.js
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// ──────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
const JWT_OPTS = {
  // You can set these via env if you use them when signing
  audience: process.env.JWT_AUD,
  issuer: process.env.JWT_ISS,
  // algorithms: ['HS256'], // uncomment if you want to restrict alg
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function getTokenFromReq(req) {
  // Header: Authorization: Bearer <token> | Token <token> | JWT <token>
  const auth = req.headers.authorization || req.headers.Authorization || '';
  if (typeof auth === 'string' && auth.length) {
    const parts = auth.trim().split(/\s+/); // ["Bearer","token"]
    if (parts.length === 2) return parts[1];
    // Fallback: if header contains just the token
    if (parts.length === 1) return parts[0];
  }

  // Common alt header
  if (req.headers['x-access-token']) return String(req.headers['x-access-token']);

  // Cookies (ensure app.use(cookieParser()) in server)
  if (req.cookies?.token) return req.cookies.token;
  if (req.cookies?.access_token) return req.cookies.access_token;
  if (req.cookies?.jwt) return req.cookies.jwt;

  // (Optional) Query param for special flows (avoid in prod)
  if (process.env.ALLOW_TOKEN_QUERY === 'true') {
    if (req.query?.token) return String(req.query.token);
  }

  return null;
}

async function loadUser(userId) {
  if (!userId) return null;
  const user = await User.findById(userId).select('-password -__v').lean();
  if (user) user.role = String(user.role || '').toLowerCase();
  return user;
}

function verifyToken(token) {
  if (!JWT_SECRET) throw new Error('JWT secret not configured');
  return jwt.verify(token, JWT_SECRET, JWT_OPTS);
}

// ──────────────────────────────────────────────────────────────
/** Strict auth: 401 if missing/invalid. Attaches req.user */
const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromReq(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Before access that page you have to login first' });
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.id || decoded.sub || decoded._id;
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    const user = await loadUser(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    // Token errors: JsonWebTokenError | TokenExpiredError | NotBeforeError
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Token verification failed';
    console.error('Auth error:', err.message);
    return res.status(401).json({ message: msg });
  }
});

/** Optional auth: never 401; attaches req.user if token is valid */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getTokenFromReq(req);
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    const userId = decoded.id || decoded.sub || decoded._id;
    if (!userId) return next();
    const user = await loadUser(userId);
    if (user) req.user = user;
  } catch {
    // ignore invalid tokens on optional routes
  }
  next();
});

/** Ensure auth; if req.user is absent, run protect */
const requireAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) return protect(req, res, next);
  next();
});

/** Role gate: 401 if not authed, 403 if role not allowed */
function requireRole(roles = []) {
  const allowed = (Array.isArray(roles) ? roles : [roles]).map(r => String(r).toLowerCase());
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const role = String(req.user.role || '').toLowerCase();
    if (!allowed.includes(role)) {
      return res.status(403).json({
        message: `Forbidden: requires one of [${allowed.join(', ')}]`,
        yourRole: role,
      });
    }
    next();
  };
}

/** Combine protect + role check */
const authorize = (roles = []) => [protect, requireRole(roles)];

/** Simple admin-only helper */
const isAdmin = (req, res, next) => {
  if (req.user && String(req.user.role).toLowerCase() === 'admin') return next();
  return res.status(403).json({ message: 'Not authorized as admin' });
};

// (Optional) Self-or-role guard, handy for /users/:userId etc.
function selfOrRole(paramName = 'userId', roles = []) {
  const allowed = (Array.isArray(roles) ? roles : [roles]).map(r => String(r).toLowerCase());
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const role = String(req.user.role || '').toLowerCase();
    const targetId = String(req.params?.[paramName] || '');
    const isSelf = targetId && String(req.user._id) === targetId;
    if (isSelf || allowed.includes(role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = { protect, optionalAuth, requireAuth, requireRole, authorize, isAdmin, selfOrRole };
