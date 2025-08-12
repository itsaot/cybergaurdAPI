const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function to generate tokens
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// REGISTER
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword, role });
    await user.save();

    const payload = { id: user.id, role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Send refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "Strict",
      domain: process.env.COOKIE_DOMAIN || "localhost",
      path: "/",
    });

    res.json({ accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = { id: user.id, role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "Strict",
      domain: process.env.COOKIE_DOMAIN,
      path: "/",
    });

    res.json({ accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// REFRESH TOKEN
exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ msg: "No refresh token" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid refresh token" });

    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });
    res.json({ accessToken });
  });
};

// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "Strict",
    domain: process.env.COOKIE_DOMAIN || "localhost",
    path: "/",
  });
  res.json({ msg: "Logged out successfully" });
};

// GET CURRENT USER
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
