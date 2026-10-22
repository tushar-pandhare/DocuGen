// backend/utils/redis.js
// Centralized Upstash Redis client for REST caching and state management

const { Redis } = require("@upstash/redis");

let redisClient = null;
let isConfigured = false;

function initRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      redisClient = new Redis({ url, token });
      isConfigured = true;
      console.log("✅ Upstash Redis client initialized");
    } catch (err) {
      console.warn("⚠️ Failed to initialize Upstash Redis:", err.message);
      redisClient = null;
      isConfigured = false;
    }
  } else {
    // Graceful fallback when Upstash credentials are not provided (e.g. initial local dev)
    console.warn("⚠️ UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. Caching disabled.");
  }
}

// Initialize on module load
initRedis();

/**
 * Check whether Redis is connected and configured
 */
function isRedisAvailable() {
  return isConfigured && redisClient !== null;
}

/**
 * Get direct reference to Upstash Redis client
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Get cached value (JSON parsed)
 */
async function getCache(key) {
  if (!isRedisAvailable()) return null;
  try {
    const data = await redisClient.get(key);
    if (data === null || data === undefined) return null;
    // @upstash/redis automatically parses JSON objects if stored as object
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (err) {
    console.warn(`Redis getCache error for key "${key}":`, err.message);
    return null;
  }
}

/**
 * Set cached value with TTL in seconds
 */
async function setCache(key, value, ttlSeconds = 300) {
  if (!isRedisAvailable()) return false;
  try {
    const serialized = typeof value === "object" ? JSON.stringify(value) : value;
    await redisClient.set(key, serialized, { ex: ttlSeconds });
    return true;
  } catch (err) {
    console.warn(`Redis setCache error for key "${key}":`, err.message);
    return false;
  }
}

/**
 * Delete a specific key
 */
async function deleteCache(key) {
  if (!isRedisAvailable()) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.warn(`Redis deleteCache error for key "${key}":`, err.message);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern (e.g. "cache:templates:*")
 */
async function deletePattern(pattern) {
  if (!isRedisAvailable()) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (err) {
    console.warn(`Redis deletePattern error for pattern "${pattern}":`, err.message);
    return false;
  }
}

// ─── AI Assistant session metadata (per-user, persisted across instances) ─────
const SESSION_META_TTL = 60 * 60 * 24; // 24 hours

/**
 * Retrieve AI assistant session metadata for a user
 */
async function getSessionMeta(userId) {
  return getCache(`session:ai:${userId}`);
}

/**
 * Persist AI assistant session metadata for a user
 */
async function setSessionMeta(userId, meta) {
  return setCache(`session:ai:${userId}`, meta, SESSION_META_TTL);
}

/**
 * Remove AI assistant session metadata for a user
 */
async function clearSessionMeta(userId) {
  return deleteCache(`session:ai:${userId}`);
}

module.exports = {
  isRedisAvailable,
  getRedisClient,
  getCache,
  setCache,
  deleteCache,
  deletePattern,
  getSessionMeta,
  setSessionMeta,
  clearSessionMeta,
};
