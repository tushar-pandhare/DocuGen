// worker/processors/invoiceProcessor.js
// Processes "invoice" queue jobs.
// Generates a PDF invoice, saves it to MongoDB, and optionally uploads
// it to Google Drive.
//
// NOTE: Invoice generation (POST /api/invoice/download) can stay synchronous
// because it completes in < 1 s and returns a binary PDF directly.
// This processor is provided for future use (e.g. bulk invoice generation)
// or if you decide to make /download async too.

const path = require("path");
const mongoose = require("mongoose");
const { Readable } = require("stream");

let dbConnected = false;
async function ensureDb() {
  if (!dbConnected && process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    dbConnected = true;
  }
}

/**
 * @param {import("bullmq").Job} job
 * @returns {Promise<{ invoiceNo: number, pdfBase64: string, driveUploaded: boolean }>}
 */
async function processInvoice(job) {
  await ensureDb();

  const Invoice = require("../../backend/models/InvoiceSchema");
  const User = require("../../backend/models/user");
  const generatePDF = require("../../backend/utils/generatePDF");

  const { userId, invoiceData, uploadToDrive } = job.data;

  await job.updateProgress(10);

  // Assign invoice number
  const lastInvoice = await Invoice.findOne({ userId }).sort({ invoiceNo: -1 });
  const newInvoiceNo = lastInvoice ? lastInvoice.invoiceNo + 1 : 1001;
  const data = { ...invoiceData, userId, invoiceNo: newInvoiceNo };

  await job.updateProgress(30);

  const pdf = await generatePDF(data);
  if (!pdf || pdf.length === 0) throw new Error("PDF generation returned empty data");

  await Invoice.create(data);
  await job.updateProgress(70);

  let driveUploaded = false;
  if (uploadToDrive) {
    try {
      const user = await User.findById(userId);
      if (user?.googleTokens) {
        const { google } = require("googleapis");
        const stream = require("stream");

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        oauth2Client.setCredentials(user.googleTokens);
        const drive = google.drive({ version: "v3", auth: oauth2Client });

        const folderQuery = await drive.files.list({
          q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: "files(id, name)",
        });
        let folderId;
        if (folderQuery.data.files.length === 0) {
          const folder = await drive.files.create({
            requestBody: { name: "DocuGen", mimeType: "application/vnd.google-apps.folder" },
          });
          folderId = folder.data.id;
        } else {
          folderId = folderQuery.data.files[0].id;
        }

        const bufferStream = new Readable();
        bufferStream.push(pdf);
        bufferStream.push(null);

        await drive.files.create({
          requestBody: { name: `INVOICE-${newInvoiceNo}.pdf`, parents: [folderId] },
          media: { mimeType: "application/pdf", body: bufferStream },
        });
        driveUploaded = true;
      }
    } catch (driveErr) {
      console.error("Drive upload failed:", driveErr.message);
    }
  }

  await job.updateProgress(100);

  return {
    invoiceNo: newInvoiceNo,
    pdfBase64: pdf.toString("base64"),
    driveUploaded,
  };
}

module.exports = { processInvoice };
