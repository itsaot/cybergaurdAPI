const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token, auth denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

exports.isModerator = (req, res, next) => {
  if (req.user.role === "moderator" || req.user.role === "admin") next();
  else res.status(403).json({ msg: "Access denied" });
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role === "admin") next();
  else res.status(403).json({ msg: "Admin access only" });
};
exports.isUser = (req, res, next) => {
  if (req.user.role === "user" || req.user.role === "moderator" || req.user.role === "admin") next();
  else res.status(403).json({ msg: "User access only" });
};
exports.isAuthenticated = (req, res, next) => {
  if (req.user) next();
  else res.status(401).json({ msg: "User not authenticated" });
};
exports.isNotAuthenticated = (req, res, next) => {
  if (!req.user) next();
  else res.status(403).json({ msg: "User already authenticated" });
};
