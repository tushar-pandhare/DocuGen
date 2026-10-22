// backend/routes/summariseRoute.js
// Exposes POST /summarise to trigger an OCR + AI Summarisation pipeline.
// Enqueues the file to the OCR queue first, then enqueues a summarise job
// that depends on the OCR job (BullMQ parent dependency).

const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");
const jobQueue = require("../queues/jobQueue");
const { registerPipeline } = require("../services/pipelineService");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

/**
 * Middleware: extracts user from Bearer token if provided,
 * otherwise falls back to anonymous user so endpoints and tests work seamlessly.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = { id: "anonymous" };
    return next();
  }

  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    try {
      const decoded = jwt.verify(parts[1], process.env.JWT_SECRET || "fallback_secret");
      req.user = decoded;
      return next();
    } catch {
      // Invalid token
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  req.user = { id: "anonymous" };
  next();
}

/**
 * POST /summarise or POST / (when mounted at /api/summarise)
 * Accepts:
 *   1) multipart/form-data with "file" (image or PDF)
 *   2) application/json with { fileBase64, filename, mimetype }
 *   3) application/json with { text, fileName } (direct text summarisation)
 * Returns:
 *   202 Accepted with { pipelineId, steps: [{type: "ocr", jobId}, {type: "summarise", jobId}] }
 */
async function handleSummarise(req, res) {
  try {
    let fileBase64, filename, mimetype;
    const userId = req.user?.id || "anonymous";

    // Case 1: Direct text provided (e.g. user triggers summary from UI on extracted text)
    if (req.body && req.body.text && typeof req.body.text === "string" && !req.file && !req.body.fileBase64) {
      const fileName = req.body.fileName || req.body.filename || "document.txt";
      const summariseJob = await jobQueue.addJob("summarise", "summarise-text", {
        userId,
        text: req.body.text,
        fileName,
        filename: fileName,
      });

      const pipelineId = `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const steps = [{ type: "summarise", jobId: summariseJob.id, queue: "summarise" }];

      registerPipeline(pipelineId, {
        pipelineId,
        userId,
        steps,
      });

      return res.status(202).json({
        pipelineId,
        jobId: summariseJob.id,
        queue: "summarise",
        steps: [{ type: "summarise", jobId: summariseJob.id }],
        message: "Summarise job enqueued — poll /api/jobs/:jobId/status?queue=summarise",
      });
    }

    // Case 2: File uploaded via multipart/form-data
    if (req.file) {
      filename = req.file.originalname;
      mimetype = req.file.mimetype;
      fileBase64 = req.file.buffer.toString("base64");
    }
    // Case 3: JSON payload with base64 file
    else if (req.body && (req.body.fileBase64 || req.body.file)) {
      fileBase64 = req.body.fileBase64 || req.body.file;
      filename = req.body.filename || req.body.fileName || "uploaded-document";
      mimetype = req.body.mimetype || "application/pdf";
    }
    // No input provided
    else {
      return res.status(400).json({ message: "No file or text uploaded" });
    }

    // Validate MIME type
    if (!mimetype.startsWith("image/") && mimetype !== "application/pdf") {
      return res.status(400).json({
        message: "Unsupported file type — please upload an image or PDF",
      });
    }

    const pipelineId = `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 1. Enqueue OCR job first
    const ocrJob = await jobQueue.addJob("ocr", "pipeline-ocr", {
      userId,
      pipelineId,
      filename,
      mimetype,
      fileBase64,
    });

    // 2. Enqueue Summarise job with BullMQ parent dependency
    const summariseJob = await jobQueue.addJob(
      "summarise",
      "pipeline-summarise",
      {
        userId,
        pipelineId,
        fileName: filename,
        filename,
        ocrJobId: ocrJob.id,
      },
      {
        parent: { id: ocrJob.id, queue: "ocr" },
      }
    );

    const steps = [
      { type: "ocr", jobId: ocrJob.id, queue: "ocr" },
      { type: "summarise", jobId: summariseJob.id, queue: "summarise" },
    ];

    registerPipeline(pipelineId, {
      pipelineId,
      userId,
      steps,
    });

    return res.status(202).json({
      pipelineId,
      steps: [
        { type: "ocr", jobId: ocrJob.id },
        { type: "summarise", jobId: summariseJob.id },
      ],
      message: "OCR and Summarisation pipeline enqueued",
    });
  } catch (err) {
    console.error("Summarise route error:", err.message);
    const status = err.status || 502;
    return res.status(status).json({
      message: "Failed to enqueue summarise pipeline",
      error: err.message,
    });
  }
}

// Mount handler on root "/" and "/summarise"
router.post("/", optionalAuth, upload.single("file"), handleSummarise);
router.post("/summarise", optionalAuth, upload.single("file"), handleSummarise);

module.exports = router;
