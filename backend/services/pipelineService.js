// backend/services/pipelineService.js
// Validates pipeline step types and builds the BullMQ job dependency chain.
// Also keeps an in-memory registry of running pipelines so the client can
// query overall pipeline status via GET /api/pipeline/:pipelineId.

const { addJob } = require("../queues/jobQueue");

// ── Allowed step types (must match queue names in jobQueue.js) ─────────────
const VALID_STEP_TYPES = new Set(["ocr", "pdfToImage", "compress", "invoice", "summarise"]);

// ── In-memory pipeline store (fine for MVP; swap to Redis/DB for prod) ─────
// Shape: { [pipelineId]: { pipelineId, userId, steps: [{type, jobId, queue}], createdAt } }
const _pipelines = new Map();

/**
 * Validate an array of step descriptors.
 * @param {Array<{type:string}>} steps
 * @throws {Error} if any step type is invalid
 */
function validateSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error("Pipeline must contain at least one step.");
  }
  for (const step of steps) {
    if (!step || typeof step.type !== "string" || !VALID_STEP_TYPES.has(step.type)) {
      throw new Error(
        `Invalid step type "${step?.type}". Allowed: ${[...VALID_STEP_TYPES].join(", ")}`
      );
    }
  }
}

/**
 * Build a pipeline: enqueue each step as a BullMQ job, chaining them so each
 * job waits for the previous one to complete before starting.
 *
 * @param {object} params
 * @param {string}        params.userId      - Authenticated user id
 * @param {Array<{type}>} params.steps       - Ordered step descriptors
 * @param {string}        params.fileBase64  - Base64-encoded file content
 * @param {string}        params.filename    - Original file name
 * @param {string}        params.mimetype    - MIME type of the uploaded file
 * @returns {Promise<{ pipelineId:string, steps:Array<{type,jobId,queue}> }>}
 */
async function buildPipeline({ userId, steps, fileBase64, filename, mimetype }) {
  validateSteps(steps);

  const pipelineId = `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const result = [];
  let previousJobId = null;

  for (const step of steps) {
    // Build common job payload — each step receives the original file so it
    // can be processed independently (e.g. OCR extracts text, compress
    // reduces the same file).
    const jobData = {
      userId,
      pipelineId,
      filename,
      mimetype,
      fileBase64,
    };

    // BullMQ job options — use parent dependency to guarantee sequential exec
    const jobOpts = {};
    if (previousJobId && result.length > 0) {
      // `parent` makes this job wait until its parent (previous step) is done
      jobOpts.parent = { id: previousJobId, queue: result[result.length - 1].queue };
    }

    // Map step type → human-readable BullMQ job name
    const jobNameMap = {
      ocr: "pipeline-ocr",
      pdfToImage: "pipeline-pdf-to-image",
      compress: "pipeline-compress",
      invoice: "pipeline-invoice",
      summarise: "pipeline-summarise",
    };

    const job = await addJob(step.type, jobNameMap[step.type], jobData, jobOpts);
    previousJobId = job.id;

    result.push({ type: step.type, jobId: job.id, queue: step.type });
  }

  // Persist pipeline metadata for later status queries
  _pipelines.set(pipelineId, {
    pipelineId,
    userId,
    steps: result,
    createdAt: new Date().toISOString(),
  });

  return { pipelineId, steps: result };
}

/**
 * Retrieve a stored pipeline by ID.
 * @param {string} pipelineId
 * @returns {{ pipelineId, userId, steps, createdAt } | undefined}
 */
function getPipeline(pipelineId) {
  return _pipelines.get(pipelineId);
}

function registerPipeline(pipelineId, data) {
  _pipelines.set(pipelineId, {
    ...data,
    createdAt: data.createdAt || new Date().toISOString(),
  });
}

module.exports = { validateSteps, buildPipeline, getPipeline, registerPipeline, VALID_STEP_TYPES };
