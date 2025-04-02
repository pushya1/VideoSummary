const express = require("express");
const { generateSpeech } = require("../controllers/streamController");
const authenticateJWT = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/stream", authenticateJWT, generateSpeech);

module.exports = router;
