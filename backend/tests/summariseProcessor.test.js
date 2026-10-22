// backend/tests/summariseProcessor.test.js
// Unit test for summariseProcessor with mocked AI responses and error scenarios.

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const openaiClient = require("../utils/openaiClient");
const { processSummarise } = require("../../worker/processors/summariseProcessor");

describe("summariseProcessor Unit Tests", () => {
  const originalGenerate = openaiClient.generateSummaryAndEntities;
  const originalCreateChat = openaiClient.createChatCompletion;
  const originalCallGemini = openaiClient.callGemini;

  afterEach(() => {
    openaiClient.generateSummaryAndEntities = originalGenerate;
    openaiClient.createChatCompletion = originalCreateChat;
    openaiClient.callGemini = originalCallGemini;
  });

  test("successfully summarizes document text and extracts entities using AI", async () => {
    openaiClient.generateSummaryAndEntities = async () => ({
      summary: "Apple Inc. announced record revenue on October 2026 led by CEO Tim Cook. The company generated $90 billion in quarterly earnings.",
      entities: {
        people: ["Tim Cook"],
        organizations: ["Apple Inc."],
        dates: ["October 2026"],
        amounts: ["$90 billion"],
      },
    });

    const mockJob = {
      id: "job-123",
      data: {
        text: "Tim Cook announced Apple Inc. earnings on October 2026 reaching $90 billion in revenue.",
        fileName: "earnings.txt",
      },
      updateProgress: async () => {},
    };

    const result = await processSummarise(mockJob);

    assert.equal(result.text, mockJob.data.text);
    assert.match(result.summary, /Apple Inc\. announced record revenue/);
    assert.deepEqual(result.entities.people, ["Tim Cook"]);
    assert.deepEqual(result.entities.organizations, ["Apple Inc."]);
    assert.deepEqual(result.entities.dates, ["October 2026"]);
    assert.deepEqual(result.entities.amounts, ["$90 billion"]);
  });

  test("handles empty or blank text gracefully without calling AI", async () => {
    let called = false;
    openaiClient.generateSummaryAndEntities = async () => {
      called = true;
      return {};
    };

    const mockJob = {
      id: "job-empty",
      data: {
        text: "   ",
        fileName: "empty.txt",
      },
      updateProgress: async () => {},
    };

    const result = await processSummarise(mockJob);

    assert.equal(called, false);
    assert.equal(result.summary, "No text available to summarize");
    assert.deepEqual(result.entities.people, []);
    assert.deepEqual(result.entities.organizations, []);
    assert.deepEqual(result.entities.dates, []);
    assert.deepEqual(result.entities.amounts, []);
  });

  test("falls back to 'Summary unavailable' when AI API call fails", async () => {
    openaiClient.generateSummaryAndEntities = async () => {
      const err = new Error("API call error / quota exceeded");
      err.status = 502;
      throw err;
    };

    const mockJob = {
      id: "job-fail",
      data: {
        text: "Some document text that could not be processed due to downstream AI error.",
        fileName: "failed.pdf",
      },
      updateProgress: async () => {},
    };

    const result = await processSummarise(mockJob);

    assert.equal(result.text, mockJob.data.text);
    assert.equal(result.summary, "Summary unavailable");
    assert.deepEqual(result.entities, {
      people: [],
      organizations: [],
      dates: [],
      amounts: [],
    });
  });
});
