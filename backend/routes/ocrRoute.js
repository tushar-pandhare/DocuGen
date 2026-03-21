//ocrRoute.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { extractText } = require("../controller/ocrController");
const auth = require("../middleware/authMiddleware");

// Store file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Route
router.post("/extract-text", auth, upload.single("file"), extractText);

module.exports = router;