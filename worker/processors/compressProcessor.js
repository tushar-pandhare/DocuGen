// worker/processors/compressProcessor.js
// Processes "compress" queue jobs.
// Compresses images (via sharp) and PDFs (via pdf-lib) and optionally
// uploads results to Google Drive.

const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const { google } = require("googleapis");
const stream = require("stream");
const mongoose = require("mongoose");

// Lazy DB connect (worker may connect independently of API server)
let dbConnected = false;
async function ensureDb() {
  if (!dbConnected && process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    dbConnected = true;
  }
}

async function uploadFileToDrive(googleTokens, fileBuffer, fileName, mimeType) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials(googleTokens);

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  const response = await drive.files.create({
    requestBody: { name: fileName },
    media: { mimeType, body: bufferStream },
  });
  return response.data;
}

/**
 * @param {import("bullmq").Job} job
 * @returns {Promise<{ files: Array }>}
 */
async function processCompress(job) {
  const { userId, quality, uploadToDrive, files } = job.data;

  let User, user;
  if (uploadToDrive) {
    await ensureDb();
    User = require("../../backend/models/user");
    user = await User.findById(userId);
    if (!user?.googleTokens) {
      throw new Error("Google Drive not connected for this user");
    }
  }

  const results = [];
  const step = 100 / Math.max(files.length, 1);

  for (let i = 0; i < files.length; i++) {
    const { originalname, mimetype, fileBase64 } = files[i];
    const buffer = Buffer.from(fileBase64, "base64");

    let compressedBuffer;
    let outputType;
    const fileName = `compressed_${originalname}`;

    if (mimetype.startsWith("image")) {
      compressedBuffer = await sharp(buffer)
        .jpeg({ quality, progressive: true })
        .toBuffer();
      outputType = "image/jpeg";
    } else if (mimetype === "application/pdf") {
      const pdfDoc = await PDFDocument.load(buffer);
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      compressedBuffer = Buffer.from(pdfBytes);
      outputType = "application/pdf";
    } else {
      continue;
    }

    let driveFile = null;
    if (uploadToDrive) {
      driveFile = await uploadFileToDrive(
        user.googleTokens, compressedBuffer, fileName, outputType
      );
    }

    results.push({
      name: fileName,
      type: outputType,
      originalSize: buffer.length,
      compressedSize: compressedBuffer.length,
      download: !uploadToDrive
        ? `data:${outputType};base64,${compressedBuffer.toString("base64")}`
        : null,
      driveFile,
    });

    await job.updateProgress(Math.round((i + 1) * step));
  }

  return { files: results };
}

module.exports = { processCompress };
