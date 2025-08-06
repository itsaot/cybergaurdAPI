const express = require("express");
const router = express.Router();

const { chat } = require("../controllers/chatbotController");

router.post("/chat", chat); // or use auth middleware if needed

module.exports = router;
