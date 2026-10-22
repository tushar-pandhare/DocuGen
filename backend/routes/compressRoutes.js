// backend/routes/compressRoutes.js
// Compression route — enqueues a BullMQ job and returns the job ID.
// The frontend polls GET /api/jobs/:id/status?queue=compress for results.

const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const { addJob } = require("../queues/jobQueue");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

/**
 * POST /api/compress
 * Accepts: multipart/form-data — field "files[]", optional body "quality" and "uploadToDrive"
 * Returns: { jobId, queue }
 */
router.post("/", auth, upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const quality = parseInt(req.body.quality) || 60;
    const uploadToDrive = req.body.uploadToDrive === "true";

    // Serialize files as base64 so they can be stored in the Redis job payload
    const files = req.files.map((f) => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      fileBase64: f.buffer.toString("base64"),
    }));

    const job = await addJob("compress", "compress-files", {
      userId: req.user.id,
      quality,
      uploadToDrive,
      files,
    });

    res.status(202).json({
      jobId: job.id,
      queue: "compress",
      message: "Compression job enqueued — poll /api/jobs/:jobId/status?queue=compress",
    });
  } catch (err) {
    console.error("Compress enqueue error:", err.message);
    res.status(err.status || 500).json({
      message: err.status === 503 ? err.message : "Failed to enqueue compression job",
    });
  }
});

module.exports = router;