// worker/processors/ocrProcessor.js
// Processes "ocr" queue jobs.
// Receives a base64-encoded file buffer, runs Tesseract (image) or
// pdf-poppler + Tesseract (PDF), and returns extracted text.

const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * @param {import("bullmq").Job} job
 * @returns {Promise<{ text: string, filename: string, charCount: number }>}
 */
async function processOcr(job) {
  const { mimetype, filename, fileBase64 } = job.data;

  await job.updateProgress(10);

  const buffer = Buffer.from(fileBase64, "base64");

  // ── Image path ─────────────────────────────────────────────────────────────
  if (mimetype.startsWith("image")) {
    const result = await Tesseract.recognize(buffer, "eng");
    await job.updateProgress(100);
    return {
      text: result.data.text,
      filename,
      charCount: result.data.text.length,
    };
  }

  // ── PDF path ────────────────────────────────────────────────────────────────
  if (mimetype === "application/pdf") {
    const poppler = require("pdf-poppler");
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ocr-"));
    const tempPdf = path.join(tmpDir, "input.pdf");

    try {
      fs.writeFileSync(tempPdf, buffer);
      await job.updateProgress(20);

      await poppler.convert(tempPdf, {
        format: "png",
        out_dir: tmpDir,
        out_prefix: "page",
        page: null,
      });

      await job.updateProgress(50);

      const imageFiles = fs
        .readdirSync(tmpDir)
        .filter((f) => f.endsWith(".png"))
        .sort();

      let fullText = "";
      const step = 40 / Math.max(imageFiles.length, 1);

      for (let i = 0; i < imageFiles.length; i++) {
        const imgPath = path.join(tmpDir, imageFiles[i]);
        const result = await Tesseract.recognize(imgPath, "eng");
        fullText += result.data.text + "\n";
        await job.updateProgress(50 + Math.round((i + 1) * step));
      }

      await job.updateProgress(100);
      return { text: fullText, filename, charCount: fullText.length };
    } finally {
      // Cleanup temp files
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  }

  throw new Error(`Unsupported mimetype: ${mimetype}`);
}

module.exports = { processOcr };
