// backend/utils/bullmqRedis.js
// Provides a single ioredis connection reused by BullMQ queues AND the worker.
// BullMQ requires ioredis (standard Redis TCP), NOT the @upstash/redis REST client.
// Upstash supports ioredis via their rediss:// TLS endpoint.

const Redis = require("ioredis");

let connection = null;

/**
 * Return (or lazily create) a shared ioredis connection for BullMQ.
 * Falls back to a local Redis if UPSTASH_REDIS_URL is not set.
 */
function getRedisConnection() {
  if (connection) return connection;

  const url =
    process.env.UPSTASH_REDIS_URL || // e.g. rediss://default:<token>@<host>:6380
    process.env.REDIS_URL ||
    "redis://localhost:6379";

  connection = new Redis(url, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,    // required by BullMQ
    tls: url.startsWith("rediss://") ? {} : undefined,
  });

  connection.on("connect", () => console.log("✅ BullMQ Redis connected"));
  connection.on("error", (err) =>
    console.error("⚠️  BullMQ Redis error:", err.message)
  );

  return connection;
}

module.exports = { getRedisConnection };
