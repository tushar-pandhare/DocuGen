// backend/tests/summariseRoute.test.js
// Integration tests for POST /summarise route using supertest.

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const express = require("express");

// Mock bullmqRedis before requiring jobQueue to avoid live connection during tests
const bullmqRedis = require("../utils/bullmqRedis");
bullmqRedis.getRedisConnection = () => ({
  on: () => {},
  status: "ready",
});

const jobQueue = require("../queues/jobQueue");
const summariseRoute = require("../routes/summariseRoute");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/summarise", summariseRoute);
  return app;
}

describe("POST /summarise Integration Tests", () => {
  const originalAddJob = jobQueue.addJob;
  let enqueuedJobs = [];

  beforeEach(() => {
    enqueuedJobs = [];
    jobQueue.addJob = async (queueName, jobName, data, opts) => {
      const jobId = `mock-job-${enqueuedJobs.length + 1}`;
      enqueuedJobs.push({ queueName, jobName, data, opts, jobId });
      return { id: jobId, name: jobName, queueName };
    };
  });

  afterEach(() => {
    jobQueue.addJob = originalAddJob;
  });

  test("accepts multipart/form-data PDF file, enqueues OCR then summarise with dependency, returns 202", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/summarise")
      .attach("file", Buffer.from("%PDF-1.4 sample content"), "test-doc.pdf")
      .expect(202);

    assert.ok(response.body.pipelineId);
    assert.equal(Array.isArray(response.body.steps), true);
    assert.equal(response.body.steps.length, 2);

    // Verify steps returned in 202 response
    const [ocrStep, summariseStep] = response.body.steps;
    assert.equal(ocrStep.type, "ocr");
    assert.equal(ocrStep.jobId, "mock-job-1");
    assert.equal(summariseStep.type, "summarise");
    assert.equal(summariseStep.jobId, "mock-job-2");

    // Verify BullMQ jobs enqueued in queue
    assert.equal(enqueuedJobs.length, 2);
    assert.equal(enqueuedJobs[0].queueName, "ocr");
    assert.equal(enqueuedJobs[0].data.filename, "test-doc.pdf");

    // Verify parent dependency on OCR job
    assert.equal(enqueuedJobs[1].queueName, "summarise");
    assert.equal(enqueuedJobs[1].data.ocrJobId, "mock-job-1");
    assert.deepEqual(enqueuedJobs[1].opts?.parent, { id: "mock-job-1", queue: "ocr" });
  });

  test("accepts base64 encoded file string via JSON and returns 202", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/summarise")
      .send({
        fileBase64: Buffer.from("fake-image-bytes").toString("base64"),
        filename: "receipt.png",
        mimetype: "image/png",
      })
      .expect(202);

    assert.ok(response.body.pipelineId);
    assert.equal(response.body.steps.length, 2);
    assert.equal(response.body.steps[0].type, "ocr");
    assert.equal(response.body.steps[1].type, "summarise");
    assert.equal(enqueuedJobs[0].queueName, "ocr");
    assert.equal(enqueuedJobs[1].queueName, "summarise");
  });

  test("accepts extracted text directly and enqueues summarise job, returns 202", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/summarise")
      .send({
        text: "John Doe purchased a subscription on January 15 for $199 from Acme Corp.",
        fileName: "notes.txt",
      })
      .expect(202);

    assert.ok(response.body.jobId);
    assert.equal(response.body.queue, "summarise");
    assert.equal(enqueuedJobs.length, 1);
    assert.equal(enqueuedJobs[0].queueName, "summarise");
    assert.match(enqueuedJobs[0].data.text, /John Doe/);
  });

  test("returns 400 Bad Request when unsupported file format is uploaded", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/summarise")
      .attach("file", Buffer.from("plain text content"), {
        filename: "test.txt",
        contentType: "text/plain",
      })
      .expect(400);

    assert.match(response.body.message, /Unsupported file type/);
    assert.equal(enqueuedJobs.length, 0);
  });

  test("returns 400 Bad Request when no file or text is uploaded", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/summarise")
      .send({})
      .expect(400);

    assert.match(response.body.message, /No file or text/);
    assert.equal(enqueuedJobs.length, 0);
  });
});
