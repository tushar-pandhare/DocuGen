function isRedisEnabled() {
  return process.env.REDIS_ENABLED !== "false";
}

function createRedisDisabledError() {
  const error = new Error("Background jobs are temporarily unavailable because Redis is disabled.");
  error.status = 503;
  return error;
}

module.exports = { isRedisEnabled, createRedisDisabledError };
