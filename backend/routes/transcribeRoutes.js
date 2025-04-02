const express = require("express");
const multer = require("multer");
const { transcribeAudio } = require("../controllers/transcribeController");
const authenticateJWT = require("../middlewares/authMiddleware");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${file.originalname}`)
});
const upload = multer({ storage });

router.post("/transcribe", authenticateJWT, upload.single("audio"), transcribeAudio);

module.exports = router;
