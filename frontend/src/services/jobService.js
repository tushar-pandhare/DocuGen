// frontend/src/services/jobService.js
// Polling helpers for BullMQ async jobs.
//
// Usage (single job):
//   const { jobId, queue } = await api.post("/ocr/extract-text", formData);
//   const result = await pollJob(jobId, queue, { onProgress: (p) => setProgress(p) });
//
// Usage (pipeline):
//   const { pipelineId, steps } = await api.post("/pipeline/run", formData);
//   await runPipeline(pipelineId, steps, { onStepUpdate: (updates) => setSteps(updates) });

import api from "./api";

const DEFAULT_INTERVAL = 2000; // ms between polls
const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes max

/**
 * Poll GET /api/jobs/:jobId/status?queue=<queue> until completed or failed.
 *
 * @param {string} jobId     - BullMQ job ID returned by the enqueue endpoint
 * @param {string} queue     - Queue name: "ocr" | "compress" | "pdfToImage" | "invoice"
 * @param {object} [opts]
 * @param {function} [opts.onProgress]  - Called with (progress: number 0-100)
 * @param {function} [opts.onStateChange] - Called with (state: string)
 * @param {number}   [opts.interval]    - Poll interval in ms (default 2000)
 * @param {number}   [opts.timeout]     - Max wait in ms (default 300000)
 * @returns {Promise<any>}  - The job's returnvalue on success
 * @throws  {Error}         - On failure or timeout
 */
export async function pollJob(jobId, queue, opts = {}) {
  const {
    onProgress = null,
    onStateChange = null,
    interval = DEFAULT_INTERVAL,
    timeout = DEFAULT_TIMEOUT,
  } = opts;

  const deadline = Date.now() + timeout;
  let lastState = null;

  while (Date.now() < deadline) {
    const { data } = await api.get(`/jobs/${jobId}/status`, {
      params: { queue },
    });

    const { state, progress, result, failReason } = data;

    // Notify state change
    if (state !== lastState) {
      lastState = state;
      onStateChange?.(state);
    }

    // Notify progress
    if (progress != null) {
      onProgress?.(progress);
    }

    if (state === "completed") {
      onProgress?.(100);
      return result;
    }

    if (state === "failed") {
      throw new Error(failReason || "Job failed");
    }

    // waiting | active | delayed — keep polling
    await sleep(interval);
  }

  throw new Error(`Job ${jobId} timed out after ${timeout / 1000}s`);
}

/**
 * Submit a job and immediately start polling, returning the final result.
 * Convenience wrapper around pollJob.
 *
 * @param {function} submitFn  - async function that returns { jobId, queue }
 * @param {object}   [opts]    - Same options as pollJob
 */
export async function submitAndPoll(submitFn, opts = {}) {
  const { jobId, queue } = await submitFn();
  return pollJob(jobId, queue, opts);
}

/**
 * Poll every step of a pipeline concurrently and report updates via callback.
 *
 * Because BullMQ already handles sequential ordering via parent dependencies,
 * the frontend can simply poll all jobs in parallel — a downstream job will
 * stay in "waiting" state until its parent completes, which is reflected here.
 *
 * @param {string} pipelineId  - Returned by POST /api/pipeline/run
 * @param {Array<{type:string, jobId:string, queue:string}>} steps
 * @param {object} [opts]
 * @param {function} [opts.onStepUpdate]  - Called with the full steps array each time any step changes
 *   Each element: { type, jobId, queue, state, progress, result, error }
 * @param {number}  [opts.interval]       - Poll interval per step (default 2000 ms)
 * @param {number}  [opts.timeout]        - Max total wait in ms (default 10 min)
 * @returns {Promise<Array<{type, result}>>}  - Ordered array of step results
 */
export async function runPipeline(pipelineId, steps, opts = {}) {
  const {
    onStepUpdate = null,
    interval = DEFAULT_INTERVAL,
    timeout = 10 * 60 * 1000,
  } = opts;

  // Initialise state array mirroring the steps prop
  const stateArr = steps.map((s) => ({
    type: s.type,
    jobId: s.jobId,
    queue: s.queue,
    state: "waiting",
    progress: 0,
    result: null,
    error: null,
  }));

  // Notify initial state immediately
  onStepUpdate?.([...stateArr]);

  /**
   * Poll a single step until it reaches a terminal state.
   * Returns the step's result (or throws on failure/timeout).
   */
  async function pollStep(index) {
    const deadline = Date.now() + timeout;
    const { jobId, queue } = steps[index];

    while (Date.now() < deadline) {
      const { data } = await api.get(`/jobs/${jobId}/status`, { params: { queue } });
      const { state, progress, result, failReason } = data;

      // Update shared state
      const changed =
        stateArr[index].state !== state ||
        stateArr[index].progress !== (progress ?? 0);

      stateArr[index] = {
        ...stateArr[index],
        state,
        progress: progress ?? stateArr[index].progress,
        result: state === "completed" ? result : null,
        error: state === "failed" ? (failReason || "Step failed") : null,
      };

      if (changed) {
        onStepUpdate?.([...stateArr]);
      }

      if (state === "completed") return result;
      if (state === "failed") throw new Error(failReason || `Step "${steps[index].type}" failed`);

      await sleep(interval);
    }

    throw new Error(`Step "${steps[index].type}" timed out`);
  }

  // Poll all steps in parallel — BullMQ's dependency chain ensures ordering
  const results = await Promise.all(steps.map((_, i) => pollStep(i)));

  // Final notification with all steps completed
  onStepUpdate?.([...stateArr]);

  return results.map((result, i) => ({ type: steps[i].type, result }));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
