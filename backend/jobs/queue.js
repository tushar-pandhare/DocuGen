const { Queue } = require("bullmq");
const { getRedisConnection } = require("../utils/bullmqRedis");

const _queues = {};

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

async function addJob(queueName, jobName, data, opts = {}) {
  const queue = getQueue(queueName);
  const job = await queue.add(jobName, data, opts);
  console.log(`📬 Job enqueued queue=${queueName} id=${job.id} name=${jobName}`);
  return job;
}

async function closeQueues() {
  for (const queue of Object.values(_queues)) {
    await queue.close();
  }
}

module.exports = { getQueue, addJob, closeQueues };
