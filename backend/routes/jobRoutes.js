// backend/routes/jobRoutes.js
// Exposes a single endpoint for the frontend to poll async job status.
//   GET /api/jobs/:id/status?queue=ocr|compress|pdfToImage|invoice

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getQueue } = require("../queues/jobQueue");

const VALID_QUEUES = ["ocr", "compress", "pdfToImage", "invoice", "ai", "summarise"];

/**
 * GET /api/jobs/:id/status?queue=<queueName>
 *
 * Returns job state so the frontend can poll until completed/failed.
 * Response shape:
 *   { jobId, state, progress, result, failReason }
 *
 * States: waiting | active | completed | failed | delayed | unknown
 */
router.get("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const queueName = req.query.queue;

    if (!queueName || !VALID_QUEUES.includes(queueName)) {
      return res.status(400).json({
        error: `Query param 'queue' must be one of: ${VALID_QUEUES.join(", ")}`,
      });
    }

    const queue = getQueue(queueName);
    const job = await queue.getJob(id);

    if (!job) {
      return res.status(404).json({ error: "Job not found", jobId: id });
    }

    const state = await job.getState();
    const progress = job.progress ?? 0;
    const statusMap = {
      waiting: "pending",
      active: "processing",
      completed: "completed",
      failed: "failed",
      delayed: "pending",
      paused: "pending",
      unknown: "pending",
    };

    return res.json({
      jobId: id,
      queue: queueName,
      state,
      status: statusMap[state] || "pending",
      progress,
      result: state === "completed" ? job.returnvalue : null,
      failReason: state === "failed" ? job.failedReason : null,
    });
  } catch (err) {
    console.error("Job status error:", err.message);
    res.status(500).json({ error: "Failed to retrieve job status" });
  }
});

module.exports = router;
