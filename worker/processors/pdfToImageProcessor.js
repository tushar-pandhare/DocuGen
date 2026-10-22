// worker/processors/pdfToImageProcessor.js
// Processes "pdfToImage" queue jobs.
// Converts each page of a PDF to a JPEG using pdf-poppler and returns
// base64-encoded images.

const fs = require("fs");
const path = require("path");
const os = require("os");
const pdfPoppler = require("pdf-poppler");

/**
 * @param {import("bullmq").Job} job
 * @returns {Promise<{ images: Array<{ name: string, download: string }> }>}
 */
async function processPdfToImage(job) {
  const { filename, fileBase64, uploadToDrive } = job.data;

  const buffer = Buffer.from(fileBase64, "base64");
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf2img-"));
  const tempPdf = path.join(tmpDir, "input.pdf");

  try {
    fs.writeFileSync(tempPdf, buffer);
    await job.updateProgress(20);

    const prefix = path.parse(filename).name;
    await pdfPoppler.convert(tempPdf, {
      format: "jpeg",
      out_dir: tmpDir,
      out_prefix: prefix,
      page: null,
    });

    await job.updateProgress(70);

    const imageFiles = fs
      .readdirSync(tmpDir)
      .filter((f) => f.endsWith(".jpg") || f.endsWith(".jpeg"))
      .sort();

    const images = imageFiles.map((f) => {
      const data = fs.readFileSync(path.join(tmpDir, f), { encoding: "base64" });
      return {
        name: f,
        download: `data:image/jpeg;base64,${data}`,
      };
    });

    await job.updateProgress(100);
    return { images, uploadedToDrive: uploadToDrive };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

module.exports = { processPdfToImage };
