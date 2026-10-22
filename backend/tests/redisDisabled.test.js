const { test } = require("node:test");
const assert = require("node:assert/strict");
const jobQueue = require("../queues/jobQueue");
const bullmqRedis = require("../utils/bullmqRedis");

test("queue access returns 503 without opening Redis when Redis is disabled", async () => {
  const originalRedisEnabled = process.env.REDIS_ENABLED;
  const originalGetRedisConnection = bullmqRedis.getRedisConnection;
  let connectionRequested = false;

  process.env.REDIS_ENABLED = "false";
  bullmqRedis.getRedisConnection = () => {
    connectionRequested = true;
    throw new Error("Redis connection should not be requested");
  };

  try {
    await assert.rejects(jobQueue.addJob("ai", "ask-document", {}), {
      message: "Background jobs are temporarily unavailable because Redis is disabled.",
      status: 503,
    });
    assert.equal(connectionRequested, false);
  } finally {
    bullmqRedis.getRedisConnection = originalGetRedisConnection;
    if (originalRedisEnabled === undefined) {
      delete process.env.REDIS_ENABLED;
    } else {
      process.env.REDIS_ENABLED = originalRedisEnabled;
    }
  }
});
