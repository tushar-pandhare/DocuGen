// backend/routes/pdfToImageRouteMain.js
// PDF → Image route — enqueues a BullMQ job and returns the job ID.
// The frontend polls GET /api/jobs/:id/status?queue=pdfToImage for JPEG pages.

const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const { addJob } = require("../queues/jobQueue");

// Use memoryStorage so the buffer is available for base64 encoding
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/pdf-to-image
 * Accepts: multipart/form-data — field "file" (PDF), optional body "uploadToDrive"
 * Returns: { jobId, queue }
 */
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Upload a valid PDF" });
    }

    const uploadToDrive =
      req.body.uploadToDrive === "true" || req.body.uploadToDrive === true;

    const job = await addJob("pdfToImage", "pdf-to-image", {
      userId: req.user.id,
      filename: req.file.originalname,
      uploadToDrive,
      fileBase64: req.file.buffer.toString("base64"),
    });

    res.status(202).json({
      jobId: job.id,
      queue: "pdfToImage",
      message: "PDF→Image job enqueued — poll /api/jobs/:jobId/status?queue=pdfToImage",
    });
  } catch (err) {
    console.error("PdfToImage enqueue error:", err.message);
    res.status(err.status || 500).json({
      message: err.status === 503 ? err.message : "Failed to enqueue PDF-to-image job",
    });
  }
});

module.exports = router;