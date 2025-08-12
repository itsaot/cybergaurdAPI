const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,    // add this
  logout,          // add this
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
} = require("../controllers/userController"); // if these are in userController.js

const { auth } = require("../middleware/auth");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);   // refresh token route (no auth middleware)
router.post("/logout", logout);          // logout route (no auth middleware)

router.get("/user", auth, getUser);
router.put("/user", auth, updateUser);
router.delete("/user", auth, deleteUser);

// Admin-only routes (optionally protect with isAdmin middleware)
router.get("/users", auth, getAllUsers);
router.get("/user/:id", auth, getUserById);

module.exports = router;
