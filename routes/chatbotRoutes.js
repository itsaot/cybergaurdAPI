const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const auth = require("../middleware/auth"); // optional, if you want to secure

router.post("/chat", auth, chatbotController.chat);

module.exports = router;
