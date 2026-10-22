// worker/worker.js
// BullMQ Worker — runs as a SEPARATE process/service (e.g. a Render worker dyno).
// It processes all heavy async jobs: OCR, compress, pdf-to-image, invoice.
//
// Start with:  node worker/worker.js
//
// Environment variables required (same .env as the API server):
//   UPSTASH_REDIS_URL      — rediss://<host>:<port> (ioredis format)
//   MONGO_URI              — for invoice jobs that write to MongoDB
//   GEMINI_API_KEY         — not needed by worker but harmless to share .env

require("dotenv").config({ path: require("path").join(__dirname, "../backend/.env") });

const { isRedisEnabled } = require("../backend/utils/redisEnabled");
if (!isRedisEnabled()) {
  console.log("Redis disabled by REDIS_ENABLED=false. Worker will not start.");
  process.exit(0);
}

const { Worker } = require("bullmq");
const path = require("path");

// ─── Processors ─────────────────────────────────────────────────────────────
const { processOcr } = require("./processors/ocrProcessor");
const { processCompress } = require("./processors/compressProcessor");
const { processPdfToImage } = require("./processors/pdfToImageProcessor");
const { processInvoice } = require("./processors/invoiceProcessor");
const { processAi } = require("./processors/aiProcessor");
const { processSummarise } = require("./processors/summariseProcessor");

// ─── Redis connection ────────────────────────────────────────────────────────
const Redis = require("ioredis");

const REDIS_URL =
  process.env.UPSTASH_REDIS_URL ||
  process.env.REDIS_URL ||
  "redis://localhost:6379";

function makeConnection() {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
  });
}

// ─── Router dispatcher ───────────────────────────────────────────────────────
const QUEUE_PROCESSORS = {
  ocr: processOcr,
  compress: processCompress,
  pdfToImage: processPdfToImage,
  invoice: processInvoice,
  ai: processAi,
  summarise: processSummarise,
};

const QUEUE_NAMES = Object.keys(QUEUE_PROCESSORS);
const workers = [];

for (const queueName of QUEUE_NAMES) {
  const processor = QUEUE_PROCESSORS[queueName];

  const worker = new Worker(
    queueName,
    async (job) => {
      console.log(`▶  [${queueName}] Processing job ${job.id} (${job.name})`);
      try {
        const result = await processor(job);
        console.log(`✅ [${queueName}] Job ${job.id} completed`);
        return result;
      } catch (err) {
        console.error(`❌ [${queueName}] Job ${job.id} failed:`, err.message);
        throw err; // BullMQ marks the job as failed and schedules retry
      }
    },
    {
      connection: makeConnection(),
      concurrency: 2, // 2 parallel jobs per queue per worker instance
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`💀 [${queueName}] Job ${job?.id} exhausted retries:`, err.message);
  });

  workers.push(worker);
  console.log(`👷 Worker listening on queue "${queueName}"`);
}

// ─── Graceful shutdown ───────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down workers...`);
  await Promise.all(workers.map((w) => w.close()));
  console.log("All workers closed. Exiting.");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log("🚀 DocuGen Worker started — listening on queues:", QUEUE_NAMES.join(", "));
