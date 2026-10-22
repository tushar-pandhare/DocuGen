// backend/routes/pipelineRoutes.js
// Pipeline router — exposes:
//   POST /api/pipeline/run   — upload a file + steps, enqueue BullMQ jobs
//   GET  /api/pipeline/:id   — fetch pipeline metadata (step jobIds + queues)

const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const { buildPipeline, getPipeline } = require("../services/pipelineService");

// Accept up to 50 MB in memory (base64 overhead is ~33 %, so real max ≈ 37 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

/**
 * POST /api/pipeline/run
 *
 * Accepts EITHER:
 *   a) multipart/form-data  — field "file" + field "steps" (JSON string)
 *   b) application/json     — { fileBase64, filename, mimetype, steps }
 *
 * Returns:
 *   { pipelineId, steps: [{ type, jobId, queue }] }
 */
router.post("/run", auth, upload.single("file"), async (req, res) => {
  try {
    let fileBase64, filename, mimetype, steps;

    // ── Determine file source ───────────────────────────────────────────────
    if (req.file) {
      // multipart upload
      fileBase64 = req.file.buffer.toString("base64");
      filename = req.file.originalname;
      mimetype = req.file.mimetype;
    } else if (req.body.fileBase64) {
      // JSON body with pre-encoded file
      fileBase64 = req.body.fileBase64;
      filename = req.body.filename || "uploaded-file";
      mimetype = req.body.mimetype || "application/octet-stream";
    } else {
      return res.status(400).json({ message: "No file provided — upload a file or pass fileBase64" });
    }

    // ── Parse steps ─────────────────────────────────────────────────────────
    if (typeof req.body.steps === "string") {
      // Sent as a form field (multipart)
      try {
        steps = JSON.parse(req.body.steps);
      } catch {
        return res.status(400).json({ message: "steps must be a valid JSON array" });
      }
    } else if (Array.isArray(req.body.steps)) {
      steps = req.body.steps;
    } else {
      return res.status(400).json({ message: "steps is required and must be a JSON array" });
    }

    // ── Build and enqueue the pipeline ──────────────────────────────────────
    const pipeline = await buildPipeline({
      userId: req.user.id,
      steps,
      fileBase64,
      filename,
      mimetype,
    });

    console.log(`🚀 Pipeline created  id=${pipeline.pipelineId}  steps=${steps.length}`);

    return res.status(202).json({
      pipelineId: pipeline.pipelineId,
      steps: pipeline.steps, // [{ type, jobId, queue }]
      message: "Pipeline enqueued — poll /api/jobs/:jobId/status?queue=<queue> per step",
    });
  } catch (err) {
    console.error("Pipeline run error:", err.message);
    const status =
      err.status ||
      (err.message.startsWith("Invalid") || err.message.startsWith("Pipeline") ? 400 : 500);
    return res.status(status).json({ message: err.message || "Failed to start pipeline" });
  }
});

/**
 * GET /api/pipeline/:id
 *
 * Returns the stored pipeline metadata (step types, jobIds, queues) so the
 * frontend can resume polling even after a page refresh.
 */
router.get("/:id", auth, (req, res) => {
  const pipeline = getPipeline(req.params.id);
  if (!pipeline) {
    return res.status(404).json({ message: "Pipeline not found" });
  }
  // Basic ownership check
  if (pipeline.userId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.json(pipeline);
});

module.exports = router;
