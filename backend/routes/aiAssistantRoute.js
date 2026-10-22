const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const AiDocumentChunk = require("../models/AiDocumentChunk");
const { addJob } = require("../queues/jobQueue");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) callback(null, true);
    else callback(new Error("Only PDF, TXT, and DOCX files are supported."));
  },
});

router.post("/upload", auth, upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document uploaded." });
    }

    const job = await addJob("ai", "index-document", {
      type: "index",
      userId: req.user.id,
      fileBuffer: req.file.buffer.toString("base64"),
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    res.status(202).json({
      jobId: job.id,
      queue: "ai",
      message: "Document indexing job queued.",
      filename: req.file.originalname,
    });
  } catch (err) {
    console.error("AI Upload enqueue error:", err.message);
    res.status(err.status || 500).json({
      message: err.status === 503 ? err.message : "Failed to enqueue document processing.",
    });
  }
});

router.post("/ask", auth, async (req, res) => {
  try {
    const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
    if (!question) {
      return res.status(400).json({ message: "Question is required." });
    }

    const job = await addJob("ai", "ask-document", {
      type: "ask",
      userId: req.user.id,
      question,
    });

    res.status(202).json({
      jobId: job.id,
      queue: "ai",
      message: "AI question job queued.",
    });
  } catch (err) {
    console.error("AI Ask enqueue error:", err.message);
    res.status(err.status || 500).json({
      message: err.status === 503 ? err.message : "Failed to enqueue question processing.",
    });
  }
});

router.get("/status", auth, async (req, res) => {
  try {
    const latestChunk = await AiDocumentChunk.findOne({ userId: req.user.id })
      .sort({ uploadedAt: -1 })
      .select("documentId filename charCount uploadedAt")
      .lean();

    if (!latestChunk) return res.json({ hasDocument: false });

    const chunks = await AiDocumentChunk.countDocuments({
      userId: req.user.id,
      documentId: latestChunk.documentId,
    });
    res.json({
      hasDocument: chunks > 0,
      filename: latestChunk.filename,
      chunks,
      charCount: latestChunk.charCount,
      uploadedAt: latestChunk.uploadedAt,
    });
  } catch (err) {
    console.error("AI session status error:", err.message);
    res.status(500).json({ message: "Failed to check the AI document session." });
  }
});

router.delete("/clear", auth, async (req, res) => {
  try {
    await AiDocumentChunk.deleteMany({ userId: req.user.id });
    res.json({ message: "Session cleared." });
  } catch (err) {
    console.error("AI document clear error:", err.message);
    res.status(500).json({ message: "Failed to clear the AI document." });
  }
});

module.exports = router;
