// backend/queues/jobQueue.js
// Shared BullMQ queue definitions.
// Each heavy operation type (ocr, compress, pdfToImage, invoice) gets its own
// named queue so workers can be scaled independently. All queues share the
// same Upstash Redis connection (using ioredis with REST-compatible settings).

const { Queue } = require("bullmq");
const { getRedisConnection } = require("../utils/bullmqRedis");

// We lazily initialise queues so the module is safe to import even when Redis
// is not yet configured (e.g. during unit-test module loading).
const _queues = {};

/**
 * Return (or lazily create) a named BullMQ Queue.
 * @param {string} name  - Queue name, one of: "ocr", "compress", "pdfToImage", "invoice"
 */
function getQueue(name) {
  if (!_queues[name]) {
    const connection = getRedisConnection();
    _queues[name] = new Queue(name, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 100 },
      },
    });
  }
  return _queues[name];
}

/**
 * Enqueue a job and return the BullMQ Job object.
 *
 * @param {string} queueName  - One of: "ocr", "compress", "pdfToImage", "invoice"
 * @param {string} jobName    - Descriptive job name (used in BullMQ dashboard)
 * @param {object} data       - Payload passed to the worker processor
 * @param {object} [opts]     - Extra BullMQ job options (priority, delay, etc.)
 * @returns {Promise<import("bullmq").Job>}
 */
async function addJob(queueName, jobName, data, opts = {}) {
  const queue = getQueue(queueName);
  const job = await queue.add(jobName, data, opts);
  console.log(`📬 Job enqueued  queue=${queueName}  id=${job.id}  name=${jobName}`);
  return job;
}

/**
 * Close all open queue connections gracefully (call on SIGTERM / SIGINT).
 */
async function closeQueues() {
  for (const [name, q] of Object.entries(_queues)) {
    await q.close();
    console.log(`🔒 Queue "${name}" closed`);
  }
}

module.exports = { getQueue, addJob, closeQueues };
