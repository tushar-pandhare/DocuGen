// backend/routes/aiAssistantRoute.js
//
// TRUE RAG PIPELINE:
//   1. Extract text from PDF / DOCX / TXT
//   2. Chunk text (800 words, 150 word overlap)
//   3. Embed each chunk → Google gemini-embedding-001 (768-dim vectors)
//   4. Store vectors → Vectra LocalIndex (file-backed, no server needed)
//   5. On question: embed question → cosine similarity search → top-5 chunks
//   6. Augment prompt with retrieved chunks → Gemini 2.5 Flash → answer
//
// NOTE: Google retired the older `embedding-001` and `gemini-1.5-flash`
// model IDs — both now return HTTP 404. This route uses the current
// model IDs (`gemini-embedding-001` and `gemini-2.5-flash`). If Google
// retires these too in the future, check https://ai.google.dev/gemini-api/docs/deprecations
// for the current replacement and update GEMINI_EMBED_URL / GEMINI_CHAT_URL below.

const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/authMiddleware");
const { LocalIndex } = require("vectra");

// ─── Config ───────────────────────────────────────────────────────────────────
const VECTOR_DB_DIR = path.join(__dirname, "../vector_store");
const GEMINI_EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";
const GEMINI_CHAT_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
// gemini-embedding-001 outputs 3072-dim vectors by default; we truncate to
// 768 to keep the vector store small and consistent across chunks/questions.
const EMBED_DIMENSIONS = 768;

// Ensure vector store directory exists
if (!fs.existsSync(VECTOR_DB_DIR)) fs.mkdirSync(VECTOR_DB_DIR, { recursive: true });

// ─── In-memory session metadata (filename, charCount etc) ─────────────────────
// Actual vectors are on disk in Vectra — survive restarts
const sessionMeta = new Map();

// ─── Multer ───────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF, TXT, and DOCX files are supported"));
  },
});

// ─── Text extraction ──────────────────────────────────────────────────────────
async function extractText(file) {
  if (file.mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }
  if (file.mimetype === "application/pdf") {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(file.buffer);
    return data.text;
  }
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
  throw new Error("Unsupported file type");
}

// ─── Chunking: sliding window with overlap ────────────────────────────────────
function chunkText(text, chunkSize = 800, overlap = 150) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
    i += chunkSize - overlap;
  }
  return chunks;
}

// ─── Google gemini-embedding-001: embed a single string → 768-dim float array ─
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

  return response.data.embedding.values; // float32[]  (768 dims)
}

// ─── Embed in batches to avoid rate limit (free tier: 1500 req/min) ───────────
async function embedBatch(texts, batchSize = 20, delayMs = 100) {
  const vectors = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchVectors = await Promise.all(batch.map(embedText));
    vectors.push(...batchVectors);
    if (i + batchSize < texts.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return vectors;
}

// ─── Get or create per-user Vectra index ──────────────────────────────────────
function getUserIndex(userId) {
  const indexPath = path.join(VECTOR_DB_DIR, userId.toString());
  return new LocalIndex(indexPath);
}

// ─── Gemini 2.5 Flash: generate answer ───────────────────────────────────────
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");

  const response = await axios.post(
    `${GEMINI_CHAT_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    },
    { headers: { "Content-Type": "application/json" }, timeout: 30000 }
  );

  const candidate = response.data?.candidates?.[0];
  if (!candidate) throw new Error("No response from Gemini");
  return candidate.content.parts.map((p) => p.text).join("");
}

// ─── ROUTE: Upload & index document ──────────────────────────────────────────
router.post("/upload", auth, upload.single("document"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No document uploaded" });

    // 1. Extract raw text
    const rawText = await extractText(req.file);
    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({
        message: "Could not extract enough text. Try a text-based PDF.",
      });
    }

    // 2. Chunk
    const chunks = chunkText(rawText);

    // 3. Embed all chunks via Google embedding-001 (free)
    console.log(`Embedding ${chunks.length} chunks for user ${req.user.id}…`);
    const vectors = await embedBatch(chunks);

    // 4. Store in Vectra (per-user file-backed index)
    const index = getUserIndex(req.user.id);

    // Recreate index (drop previous document)
    await index.createIndex({ version: 1, deleteIfExists: true });

    await index.beginUpdate();
    for (let i = 0; i < chunks.length; i++) {
      await index.insertItem({
        vector: vectors[i],       // 768-dim float array
        metadata: {
          text: chunks[i],        // original text of this chunk
          chunkIndex: i,          // position in document
        },
      });
    }
    await index.endUpdate();

    // 5. Save session metadata
    sessionMeta.set(req.user.id, {
      filename: req.file.originalname,
      chunks: chunks.length,
      charCount: rawText.length,
      uploadedAt: new Date(),
    });

    res.json({
      message: "Document indexed successfully",
      filename: req.file.originalname,
      chunks: chunks.length,
      charCount: rawText.length,
    });
  } catch (err) {
    console.error("AI Upload error:", err.message);
    res.status(500).json({ message: err.message || "Failed to process document" });
  }
});

// ─── ROUTE: Ask a question ────────────────────────────────────────────────────
router.post("/ask", auth, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Check index exists for this user
    const index = getUserIndex(req.user.id);
    if (!(await index.isIndexCreated())) {
      return res.status(400).json({
        message: "No document uploaded. Please upload a document first.",
      });
    }

    const stats = await index.getIndexStats();
    if (stats.items === 0) {
      return res.status(400).json({
        message: "No document indexed. Please upload a document first.",
      });
    }

    // 1. Embed the question (same model, same vector space)
    const questionVector = await embedText(question);

    // 2. Cosine similarity search → top 5 chunks
    //    Vectra returns results sorted by score DESC (1 = identical, 0 = orthogonal)
    const results = await index.queryItems(questionVector, undefined, 5);

    if (!results || results.length === 0) {
      return res.json({
        answer: "I couldn't find relevant information in the document for your question.",
        filename: sessionMeta.get(req.user.id)?.filename,
      });
    }

    // 3. Sort retrieved chunks by original position (preserve reading order)
    const topChunks = results
      .sort((a, b) => a.item.metadata.chunkIndex - b.item.metadata.chunkIndex)
      .map((r) => r.item.metadata.text);

    // 4. Build augmented prompt
    const context = topChunks.join("\n\n---\n\n");
    const prompt = `You are a helpful document assistant. Answer the user's question based ONLY on the document context below.
If the answer is not found in the context, say "I couldn't find that information in the uploaded document."
Be concise, accurate, and use bullet points when listing multiple items.

DOCUMENT CONTEXT:
${context}

USER QUESTION: ${question}

ANSWER:`;

    // 5. Generate answer with Gemini 1.5 Flash
    const answer = await callGemini(prompt);

    res.json({
      answer,
      filename: sessionMeta.get(req.user.id)?.filename,
      chunksUsed: topChunks.length,
      topScores: results.map((r) => r.score.toFixed(3)),
    });
  } catch (err) {
    console.error("AI Ask error:", err.message);

    if (err.message?.includes("GEMINI_API_KEY")) {
      return res.status(500).json({ message: err.message });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({
        message: "Rate limit reached. Please wait a moment and try again.",
      });
    }

    res.status(500).json({ message: "Failed to get answer from AI" });
  }
});

// ─── ROUTE: Session status ────────────────────────────────────────────────────
router.get("/status", auth, async (req, res) => {
  try {
    const index = getUserIndex(req.user.id);
    const exists = await index.isIndexCreated();

    if (!exists) return res.json({ hasDocument: false });

    const stats = await index.getIndexStats();
    if (stats.items === 0) return res.json({ hasDocument: false });

    const meta = sessionMeta.get(req.user.id);
    res.json({
      hasDocument: true,
      filename: meta?.filename || "Unknown",
      chunks: stats.items,
      charCount: meta?.charCount,
      uploadedAt: meta?.uploadedAt,
    });
  } catch {
    res.json({ hasDocument: false });
  }
});

// ─── ROUTE: Clear document + index ───────────────────────────────────────────
router.delete("/clear", auth, async (req, res) => {
  try {
    const index = getUserIndex(req.user.id);
    if (await index.isIndexCreated()) {
      await index.deleteIndex();
    }
    sessionMeta.delete(req.user.id);
    res.json({ message: "Session cleared" });
  } catch (err) {
    console.error("Clear error:", err.message);
    res.status(500).json({ message: "Failed to clear session" });
  }
});

module.exports = router;