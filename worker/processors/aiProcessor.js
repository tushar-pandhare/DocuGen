const axios = require("axios");

const GEMINI_EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";
const GEMINI_CHAT_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const EMBED_DIMENSIONS = 768;

let databaseConnection;
async function ensureDatabase(mongoose) {
  if (mongoose.connection.readyState === 1) return;
  if (!databaseConnection) {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/DocuGen";
    databaseConnection = mongoose
      .connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
      .catch((error) => {
        databaseConnection = null;
        throw error;
      });
  }
  await databaseConnection;
  if (mongoose.connection.readyState !== 1) {
    throw new Error("AI document model is not connected to MongoDB.");
  }
}

async function embedText(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");

  const response = await axios.post(
    `${GEMINI_EMBED_URL}?key=${apiKey}`,
    {
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
      embedContentConfig: { outputDimensionality: EMBED_DIMENSIONS },
    },
    { headers: { "Content-Type": "application/json" }, timeout: 15000 }
  );

  return response.data.embedding.values;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");

  const response = await axios.post(
    `${GEMINI_CHAT_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1800 },
    },
    { headers: { "Content-Type": "application/json" }, timeout: 30000 }
  );

  const candidate = response.data?.candidates?.[0];
  if (!candidate) throw new Error("No response from Gemini");
  return candidate.content.parts.map((part) => part.text).join("");
}

function chunkText(text, chunkSize = 800, overlap = 150) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let index = 0; index < words.length; index += chunkSize - overlap) {
    chunks.push(words.slice(index, index + chunkSize).join(" "));
  }
  return chunks;
}

function cosineSimilarity(left, right) {
  if (!Array.isArray(left) || left.length !== right.length || left.length === 0) return -1;
  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dotProduct += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }
  if (leftMagnitude === 0 || rightMagnitude === 0) return -1;
  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

async function processAi(job) {
  const AiDocumentChunk = require("../../backend/models/AiDocumentChunk");
  const mongoose = AiDocumentChunk.base;
  await ensureDatabase(mongoose);
  const { type, userId, fileBuffer, filename, question, text } = job.data;

  if (type === "index") {
    let rawText = text;
    if (!rawText && fileBuffer) {
      const buffer = Buffer.from(fileBuffer, "base64");
      if (job.data.mimetype === "application/pdf") {
        const pdfParse = require("pdf-parse");
        const parsed = await pdfParse(buffer);
        rawText = parsed.text;
      } else if (
        job.data.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const mammoth = require("mammoth");
        const parsed = await mammoth.extractRawText({ buffer });
        rawText = parsed.value;
      } else if (job.data.mimetype === "text/plain") {
        rawText = buffer.toString("utf-8");
      } else {
        throw new Error(`Unsupported document type: ${job.data.mimetype || "unknown"}`);
      }
    }

    if (!rawText || rawText.trim().length < 50) {
      throw new Error("Could not extract enough text. Try a text-based PDF.");
    }

    rawText = rawText.trim();
    const chunks = chunkText(rawText);
    const vectors = [];
    for (let index = 0; index < chunks.length; index += 20) {
      const batch = chunks.slice(index, index + 20);
      const batchVectors = await Promise.all(batch.map(embedText));
      vectors.push(...batchVectors);
      await job.updateProgress(Math.min(95, Math.round(((index + batch.length) / chunks.length) * 95)));
    }

    const documentId = new mongoose.Types.ObjectId();
    const uploadedAt = new Date();
    const chunkDocuments = chunks.map((chunk, chunkIndex) => ({
      userId,
      documentId,
      filename: filename || "Uploaded document",
      charCount: rawText.length,
      uploadedAt,
      chunkIndex,
      text: chunk,
      embedding: vectors[chunkIndex],
    }));

    try {
      for (let index = 0; index < chunkDocuments.length; index += 100) {
        await AiDocumentChunk.insertMany(chunkDocuments.slice(index, index + 100));
      }
      await AiDocumentChunk.deleteMany({ userId, documentId: { $ne: documentId } });
    } catch (error) {
      await AiDocumentChunk.deleteMany({ userId, documentId }).catch((cleanupError) => {
        console.error("Failed to clean up incomplete AI document index:", cleanupError.message);
      });
      throw error;
    }

    await job.updateProgress(100);
    return {
      message: "Document indexed successfully",
      filename: filename || "Uploaded document",
      chunks: chunks.length,
      charCount: rawText.length,
    };
  }

  if (type === "ask") {
    const chunks = await AiDocumentChunk.find({ userId })
      .select("filename chunkIndex text embedding")
      .lean();
    if (chunks.length === 0) {
      throw new Error("No document uploaded. Please upload a document first.");
    }

    const questionVector = await embedText(question);
    const rankedChunks = chunks
      .map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(questionVector, chunk.embedding),
      }))
      .filter((chunk) => chunk.score >= 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);
    if (rankedChunks.length === 0) {
      throw new Error("No compatible document embeddings found. Upload the document again.");
    }

    const topChunks = rankedChunks.map((chunk) => chunk.text);
    const context = topChunks.join("\n\n---\n\n");
    const prompt = `You are a clear, thoughtful document assistant. Answer the user's actual question using only the document context below. Do not merely repeat or summarize the whole document unless asked.

Write in polished Markdown:
- Start with a direct answer.
- Keep the explanation focused and use plain, natural language.
- For a multi-step explanation, use a short heading and numbered steps; for a simple answer, do not add unnecessary headings.
- Use bullets for related takeaways and bold only for important terms or the final result.
- For interview puzzles, explain the key insight, show the reasoning/calculation, and verify the result or worst case when the context supports it.
- Preserve important numbers, conditions, and caveats from the document. Do not invent missing details or claim an inference is stated in the document.
- If the context does not contain the answer, say: "I couldn't find that information in the uploaded document." You may then briefly say what related information is available.

DOCUMENT CONTEXT:
${context}

USER QUESTION: ${question}

ANSWER:`;

    return {
      answer: await callGemini(prompt),
      filename: chunks[0].filename,
      chunksUsed: topChunks.length,
      topScores: rankedChunks.map((chunk) => chunk.score.toFixed(3)),
    };
  }

  throw new Error(`Unsupported AI job type: ${type}`);
}

module.exports = { processAi };
