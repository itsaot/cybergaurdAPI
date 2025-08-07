const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
} = require("../controllers/userController");
const { auth } = require("../middleware/auth");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/user", auth, getUser);
router.put("/user", auth, updateUser);
router.delete("/user", auth, deleteUser);

// Admin-only routes (optionally protect with isAdmin middleware)
router.get("/users", auth, getAllUsers);
router.get("/user/:id", auth, getUserById);

module.exports = router;
