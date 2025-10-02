const jwt = require("jsonwebtoken");

// ✅ Auth middleware: verifies token and attaches user payload
exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.role) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// ✅ Role-based guards
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "No user in request" });
  }
  if (req.user.role === "admin") return next();
  return res.status(403).json({ msg: "Admin access only" });
};

exports.isModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "No user in request" });
  }
  if (["moderator", "admin"].includes(req.user.role)) return next();
  return res.status(403).json({ msg: "Moderator or admin access only" });
};

exports.isUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "No user in request" });
  }
  if (["user", "moderator", "admin"].includes(req.user.role)) return next();
  return res.status(403).json({ msg: "User access only" });
};

exports.isAuthenticated = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ msg: "User not authenticated" });
};

exports.isNotAuthenticated = (req, res, next) => {
  if (!req.user) return next();
  return res.status(403).json({ msg: "User already authenticated" });
};
