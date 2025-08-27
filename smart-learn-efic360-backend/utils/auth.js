exports.requireAuth = (req, res, next) => {
  // TODO: replace with your JWT/Session logic
  if (!req.user) {
    // for local testing:
    req.user = { _id: "000000000000000000000001", role: "student", name: "Test Student" };
  }
  next();
};

exports.requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};
