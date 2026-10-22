// backend/utils/openaiClient.js
// AI client wrapper supporting Gemini (used by the RAG model) and OpenAI fallback.

const axios = require("axios");

const GEMINI_CHAT_URL =
  process.env.GEMINI_CHAT_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const OPENAI_API_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Call Gemini Flash API to generate content with structured JSON.
 *
 * @param {string} prompt - Full text prompt
 * @param {object} [options]
 * @returns {Promise<any>} - Parsed JSON object
 */
async function callGemini(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY is not configured in .env");
    err.status = 502;
    throw err;
  }

  const response = await axios.post(
    `${GEMINI_CHAT_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        responseMimeType: "application/json",
        maxOutputTokens: options.maxOutputTokens || 2048,
      },
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: options.timeout || 30000,
    }
  );

  const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error("No response content received from Gemini");
  }

  try {
    return JSON.parse(candidateText);
  } catch {
    return { raw: candidateText };
  }
}

/**
 * Sends a chat completion request to the OpenAI endpoint.
 *
 * @param {Array<{role: string, content: string}>} messages - Array of chat messages
 * @param {object} [options]
 * @returns {Promise<any>} - OpenAI response data object
 */
async function createChatCompletion(messages, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "YOUR_KEY") {
    const err = new Error("OPENAI_API_KEY is not configured or set to placeholder value");
    err.status = 502;
    throw err;
  }

  const payload = {
    model: options.model || DEFAULT_OPENAI_MODEL,
    messages,
    temperature: options.temperature ?? 0.2,
    ...(options.response_format ? { response_format: options.response_format } : {}),
    ...options.extraParams,
  };

  try {
    const response = await axios.post(OPENAI_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: options.timeout || 60000,
    });

    return response.data;
  } catch (err) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.error?.message || err.message;
    const downstreamError = new Error(`OpenAI API request failed: ${message}`);
    downstreamError.status = status;
    downstreamError.originalError = err;
    throw downstreamError;
  }
}

/**
 * Generate a summary and extract key entities using Gemini (default) or OpenAI.
 *
 * @param {string} text - Document plain text
 * @param {string} [fileName] - Optional document filename
 * @returns {Promise<{ summary: string, entities: { people: string[], organizations: string[], dates: string[], amounts: string[] } }>}
 */
async function generateSummaryAndEntities(text, fileName = "document") {
  const prompt = `You are a document analysis assistant. Analyze the provided document text and perform two tasks:
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
}

Document Name: ${fileName}

Document Text:
${text}`;

  // Prioritize Gemini (same API key used for RAG model)
  if (process.env.GEMINI_API_KEY) {
    const parsed = await callGemini(prompt);
    return {
      summary: parsed.summary || "Summary unavailable",
      entities: {
        people: Array.isArray(parsed.entities?.people) ? parsed.entities.people : [],
        organizations: Array.isArray(parsed.entities?.organizations) ? parsed.entities.organizations : [],
        dates: Array.isArray(parsed.entities?.dates) ? parsed.entities.dates : [],
        amounts: Array.isArray(parsed.entities?.amounts) ? parsed.entities.amounts : [],
      },
    };
  }

  // Fallback to OpenAI if configured
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "YOUR_KEY") {
    const response = await createChatCompletion(
      [
        { role: "system", content: "You are a document analysis assistant. Respond in JSON." },
        { role: "user", content: prompt },
      ],
      {
        model: DEFAULT_OPENAI_MODEL,
        response_format: { type: "json_object" },
      }
    );
    const content = response?.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return {
      summary: parsed.summary || "Summary unavailable",
      entities: {
        people: Array.isArray(parsed.entities?.people) ? parsed.entities.people : [],
        organizations: Array.isArray(parsed.entities?.organizations) ? parsed.entities.organizations : [],
        dates: Array.isArray(parsed.entities?.dates) ? parsed.entities.dates : [],
        amounts: Array.isArray(parsed.entities?.amounts) ? parsed.entities.amounts : [],
      },
    };
  }

  throw new Error("Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured in .env");
}

module.exports = {
  callGemini,
  createChatCompletion,
  generateSummaryAndEntities,
  OPENAI_API_URL,
  DEFAULT_MODEL: DEFAULT_OPENAI_MODEL,
};
