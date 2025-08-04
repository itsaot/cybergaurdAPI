const express = require("express");
const router = express.Router();
const moderationController = require("../controllers/moderationController");
const { auth } = require("../middleware/auth"); // admin login middleware

// Flag a post (anonymous, no login)
router.post("/flag", moderationController.flagPost);

// Give advice on a post (anonymous, no login)
router.post("/advice", moderationController.giveAdvice);

// Get all advice for a post (public)
router.get("/advice/:postId", moderationController.getAdviceByPost);

// Get all flags (admin only)
router.get("/flags", auth, moderationController.getFlags);

module.exports = router;
