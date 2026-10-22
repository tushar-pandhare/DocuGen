// backend/routes/ocrRoute.js
// OCR route — enqueues a BullMQ job and immediately returns the job ID.
// The frontend polls GET /api/jobs/:id/status?queue=ocr for the result.

const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const { addJob } = require("../queues/jobQueue");

const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/ocr/extract-text
 * Accepts: multipart/form-data with field "file" (image or PDF)
 * Returns: { jobId, queue } — client should poll /api/jobs/:jobId/status?queue=ocr
 */
router.post("/extract-text", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { mimetype, originalname, buffer } = req.file;

    if (!mimetype.startsWith("image") && mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Unsupported file type — send an image or PDF" });
    }

    const job = await addJob("ocr", "extract-text", {
      userId: req.user.id,
      filename: originalname,
      mimetype,
      // Convert Buffer to base64 string so it survives JSON serialization through Redis
      fileBase64: buffer.toString("base64"),
    });

    res.status(202).json({
      jobId: job.id,
      queue: "ocr",
      message: "OCR job enqueued — poll /api/jobs/:jobId/status?queue=ocr for results",
    });
  } catch (err) {
    console.error("OCR enqueue error:", err.message);
    res.status(500).json({ message: "Failed to enqueue OCR job" });
  }
});

module.exports = router;