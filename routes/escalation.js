// routes/escalation.js
const express = require("express");
const router = express.Router();
const { escalatePost } = require("../controllers/escalationController");
const { auth } = require("../middleware/auth");

router.post("/:postId", auth, escalatePost);

module.exports = router;