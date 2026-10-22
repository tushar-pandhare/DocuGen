// worker/processors/summariseProcessor.js
// Processes "summarise" queue jobs.
// Generates a concise 2-3 sentence summary and extracts key entities (people,
// organizations, dates, amounts) using OpenAI GPT-4o-mini (or compatible model).

const openaiClient = require("../../backend/utils/openaiClient");
const { getQueue } = require("../../backend/queues/jobQueue");

/**
 * Worker processor for the "summarise" queue.
 *
 * @param {import("bullmq").Job} job
 * @returns {Promise<{
 *   text: string,
 *   summary: string,
 *   entities: {
 *     people: string[],
 *     organizations: string[],
 *     dates: string[],
 *     amounts: string[]
 *   }
 * }>}
 */
async function processSummarise(job) {
  const jobId = job.id;
  const fileName = job.data?.fileName || job.data?.filename || "document";
  let text = job.data?.text;

  await job.updateProgress(10);

  // If text is not provided directly, retrieve it from the parent OCR job
  const parentOcrId = job.data?.ocrJobId || job.opts?.parent?.id || job.parent?.id;
  if ((!text || typeof text !== "string" || !text.trim()) && parentOcrId) {
    try {
      const ocrQueue = getQueue("ocr");
      let ocrJob = await ocrQueue.getJob(parentOcrId);

      const start = Date.now();
      // Wait up to 180s for parent OCR job if it is still processing
      while (ocrJob && Date.now() - start < 180000) {
        const state = await ocrJob.getState();
        if (state === "completed") {
          text = ocrJob.returnvalue?.text || "";
          break;
        }
        if (state === "failed") {
          throw new Error(`Parent OCR job ${parentOcrId} failed: ${ocrJob.failedReason || "unknown error"}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        ocrJob = await ocrQueue.getJob(parentOcrId);
      }
    } catch (err) {
      console.error(`[summarise] Failed to resolve parent OCR job ${parentOcrId}:`, err.message);
    }
  }

  text = text || "";
  await job.updateProgress(30);

  // Handle empty text edge case
  if (!text.trim()) {
    await job.updateProgress(100);
    return {
      text: "",
      summary: "No text available to summarize",
      entities: { people: [], organizations: [], dates: [], amounts: [] },
    };
  }

  const systemPrompt = `You are a document analysis assistant. Analyze the provided document text and perform two tasks:
1. Produce a concise 2-3 sentence summary of the document.
2. Extract key entities into four categories:
   - people: list of full names of persons mentioned
   - organizations: list of companies, institutions, agencies, or organization names
   - dates: list of specific dates, years, or timeframes mentioned
   - amounts: list of monetary values, currencies, prices, or financial numbers

You MUST return a valid JSON object matching this schema exactly:
{
  "summary": "2-3 sentence summary here.",
  "entities": {
    "people": [],
    "organizations": [],
    "dates": [],
    "amounts": []
  }
}`;

  const userPrompt = `Document Name: ${fileName}\n\nDocument Text:\n${text}`;

  let summary = "Summary unavailable";
  let entities = {
    people: [],
    organizations: [],
    dates: [],
    amounts: [],
  };

  try {
    await job.updateProgress(50);

    if (typeof openaiClient.generateSummaryAndEntities === "function") {
      const aiResult = await openaiClient.generateSummaryAndEntities(text, fileName);
      if (aiResult?.summary) summary = aiResult.summary.trim();
      if (aiResult?.entities) {
        entities = {
          people: Array.isArray(aiResult.entities.people) ? aiResult.entities.people : [],
          organizations: Array.isArray(aiResult.entities.organizations) ? aiResult.entities.organizations : [],
          dates: Array.isArray(aiResult.entities.dates) ? aiResult.entities.dates : [],
          amounts: Array.isArray(aiResult.entities.amounts) ? aiResult.entities.amounts : [],
        };
      }
    } else {
      const response = await openaiClient.createChatCompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        {
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          temperature: 0.2,
        }
      );

      const content = response?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        if (parsed.summary && typeof parsed.summary === "string") {
          summary = parsed.summary.trim();
        }

        if (parsed.entities && typeof parsed.entities === "object") {
          entities = {
            people: Array.isArray(parsed.entities.people) ? parsed.entities.people : [],
            organizations: Array.isArray(parsed.entities.organizations) ? parsed.entities.organizations : [],
            dates: Array.isArray(parsed.entities.dates) ? parsed.entities.dates : [],
            amounts: Array.isArray(parsed.entities.amounts) ? parsed.entities.amounts : [],
          };
        }
      }
    }

    await job.updateProgress(90);
  } catch (err) {
    // If the LLM call fails, fall back to showing "Summary unavailable" and log the error
    console.error(`[summarise] LLM call failed for job ${jobId}:`, err.message);
    summary = "Summary unavailable";
    entities = {
      people: [],
      organizations: [],
      dates: [],
      amounts: [],
    };
  }

  await job.updateProgress(100);

  const result = {
    text,
    summary,
    entities,
  };

  return result;
}

module.exports = { processSummarise };
