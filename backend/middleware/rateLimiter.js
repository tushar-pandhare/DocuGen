// backend/middleware/rateLimiter.js
// Distributed rate limiter backed by Upstash Redis across all load-balanced instances

const rateLimit = require("express-rate-limit");
const { isRedisAvailable, getRedisClient } = require("../utils/redis");

/**
 * Creates a rate limiting middleware using Upstash Redis with in-memory fallback
 */
function createDistributedRateLimiter({ windowMs, max, message, prefix }) {
  const windowSec = Math.ceil(windowMs / 1000);

  // In-memory fallback if Redis is not configured
  const localFallback = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

  return async function (req, res, next) {
    if (!isRedisAvailable()) {
      return localFallback(req, res, next);
    }

    try {
      const redis = getRedisClient();
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.ip ||
        req.socket.remoteAddress ||
        "unknown_client";

      const key = `ratelimit:${prefix}:${ip}`;

      // Atomically increment request count
      const current = await redis.incr(key);

      // Set expiry on first request in window
      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - current));

      if (current > max) {
        return res.status(429).json({
          success: false,
          message,
        });
      }

      next();
    } catch (err) {
      console.warn("Redis rate limiter error, falling back to in-memory:", err.message);
      return localFallback(req, res, next);
    }
  };
}

// Global API rate limiter (300 requests per 15 minutes)
const apiLimiter = createDistributedRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please try again later.",
  prefix: "api",
});

// Strict auth rate limiter (20 attempts per 15 minutes)
const authLimiter = createDistributedRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many auth attempts, please try again later.",
  prefix: "auth",
});

module.exports = { apiLimiter, authLimiter };
