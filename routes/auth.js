const express = require("express");
const router = express.Router();
const { register, login, getUser } = require("../controllers/userController");
const { auth } = require("../middleware/auth");

// ✅ Added these:
router.post("/register", register);
router.post("/login", login);

// ✅ Already present:
router.get("/user", auth, getUser);

module.exports = router;
