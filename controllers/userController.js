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

// Updated cookie options for cross-origin + local dev
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only HTTPS in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // None in prod for cross-site, Lax for localhost
  path: "/", // valid for all routes
};

// ----------------------
// REGISTER
// ----------------------
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword, role });
    await user.save();

    const payload = { id: user.id, role: user.role, username: user.username };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Send refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({ accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// ----------------------
// LOGIN
// ----------------------
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = {
      id: user.id,
      role: user.role,
      username: user.username
    };

    // ✅ Use utility functions
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // ✅ Secure cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only HTTPS in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }, cookieOptions);

    res.json({ accessToken });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server error");
  }
};


// ----------------------
// REFRESH TOKEN
// ----------------------
exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ msg: "No refresh token" });

  // Debug: check if cookie arrives
  // console.log("Received cookies:", req.cookies);

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid refresh token" });

    const accessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
      username: decoded.username, // include username for frontend
    });

    res.json({ accessToken });
  });
};

// ----------------------
// LOGOUT
// ----------------------
exports.logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });
  res.json({ msg: "Logged out successfully" });
};

// ----------------------
// GET CURRENT USER
// ----------------------
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// ----------------------
// UPDATE USER
// ----------------------
exports.updateUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;

    await user.save();
    res.json({ msg: "User updated successfully", user: { ...user._doc, password: undefined } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ----------------------
// DELETE USER
// ----------------------
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await user.remove();
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ----------------------
// GET ALL USERS
// ----------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ----------------------
// GET USER BY ID (net fela di admin)
// ----------------------
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ✅ Create a new admin
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) return res.status(400).json({ msg: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({ username, email, password: hashedPassword, role: "admin" });
    await newAdmin.save();

    res.status(201).json({ msg: "Admin created successfully", user: { ...newAdmin._doc, password: undefined } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to create admin" });
  }
};

// ✅ Promote an existing user to admin
exports.promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.role = "admin";
    await user.save();

    res.json({ msg: `${user.username} is now an admin`, user: { ...user._doc, password: undefined } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to promote user" });
  }
};

// Access token
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" // fallback to 15 minutes
  });
}

// Refresh token
function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" // fallback to 7 days
  });
}

