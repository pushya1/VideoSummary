const express = require("express");
const { chatbotResponse } = require("../controllers/chatbotController");
const authenticateJWT = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/chatbot", authenticateJWT, chatbotResponse);

module.exports = router;
