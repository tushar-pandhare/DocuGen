const express = require("express");
const { google } = require("googleapis");
const { Readable } = require("stream");
const auth = require("../middleware/authMiddleware");
const Invoice = require("../models/InvoiceSchema");
const User = require("../models/user");
const generatePDF = require("../utils/generatePDF");

const router = express.Router();
const VALID_STATUSES = new Set(["pending", "paid"]);

class InvoiceInputError extends Error {}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function getInvoiceInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new InvoiceInputError("Invoice data must be a JSON object.");
  }

  const client = typeof body.client === "string" ? body.client.trim() : "";
  if (!client || client.length > 200) {
    throw new InvoiceInputError("Enter a client name (maximum 200 characters).");
  }

  const company = typeof body.company === "string" && body.company.trim()
    ? body.company.trim()
    : "DocuGen";
  if (company.length > 200) {
    throw new InvoiceInputError("Company name must be 200 characters or fewer.");
  }

  const clientEmail = typeof body.clientEmail === "string" ? body.clientEmail.trim() : "";
  if (clientEmail.length > 254 || (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail))) {
    throw new InvoiceInputError("Enter a valid client email address.");
  }
  const clientPhone = typeof body.clientPhone === "string" ? body.clientPhone.trim() : "";
  if (clientPhone.length > 50) {
    throw new InvoiceInputError("Client phone must be 50 characters or fewer.");
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
    throw new InvoiceInputError("Add between 1 and 100 invoice items.");
  }

  const items = body.items.map((item, index) => {
    const row = item && typeof item === "object" ? item : {};
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const qty = Number(row.qty);
    const price = Number(row.price);

    if (!name || name.length > 200) {
      throw new InvoiceInputError(`Enter a name of 1–200 characters for item ${index + 1}.`);
    }
    if (!Number.isFinite(qty) || qty <= 0 || qty > 1000000) {
      throw new InvoiceInputError(`Item ${index + 1} must have a quantity greater than zero.`);
    }
    if (!Number.isFinite(price) || price < 0 || price > 1000000000) {
      throw new InvoiceInputError(`Item ${index + 1} has an invalid unit price.`);
    }

    return { name, qty, price: Math.round(price * 100) / 100 };
  });

  const date = body.date || new Date().toISOString().slice(0, 10);
  const dueDate = body.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  if (!validDate(date) || !validDate(dueDate)) {
    throw new InvoiceInputError("Enter valid invoice and due dates.");
  }

  const gstRate = Number(body.gstRate ?? 18);
  if (!Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) {
    throw new InvoiceInputError("Tax rate must be between 0 and 100 percent.");
  }

  const rawSubtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  if (!Number.isFinite(rawSubtotal) || !Number.isSafeInteger(Math.round(rawSubtotal * 100))) {
    throw new InvoiceInputError("Invoice total is too large.");
  }
  const subtotal = Math.round(rawSubtotal * 100) / 100;
  const gst = Math.round(subtotal * gstRate) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;
  if (!Number.isSafeInteger(Math.round(total * 100))) {
    throw new InvoiceInputError("Invoice total is too large.");
  }
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (notes.length > 2000) {
    throw new InvoiceInputError("Notes must be 2,000 characters or fewer.");
  }

  return {
    client,
    clientEmail,
    clientPhone,
    company,
    items,
    date,
    dueDate,
    gstRate,
    subtotal,
    gst,
    total,
    notes,
  };
}

function sendPdf(res, pdf, invoiceNo) {
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="INVOICE-${invoiceNo}.pdf"`,
    "X-Invoice-Number": String(invoiceNo),
  });
  res.send(pdf);
}

async function uploadToDrive(userId, pdf, invoiceNo) {
  const user = await User.findById(userId).select("googleTokens");
  if (!user?.googleTokens?.access_token) {
    throw new Error("Google Drive is not connected.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials(user.googleTokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const existingFolders = await drive.files.list({
    q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: "files(id)",
    pageSize: 1,
  });
  const folderId = existingFolders.data.files?.[0]?.id ||
    (await drive.files.create({
      requestBody: { name: "DocuGen", mimeType: "application/vnd.google-apps.folder" },
      fields: "id",
    })).data.id;

  await drive.files.create({
    requestBody: { name: `INVOICE-${invoiceNo}.pdf`, parents: [folderId] },
    media: { mimeType: "application/pdf", body: Readable.from(pdf) },
    fields: "id",
  });
}

router.get("/", auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    await Invoice.updateMany(
      { userId: req.user.id, status: "pending", dueDate: { $lt: today } },
      { $set: { status: "overdue" } }
    );
    const invoices = await Invoice.find({ userId: req.user.id })
      .select("-__v -userId")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json(invoices);
  } catch (err) {
    console.error("Invoice list error:", err.message);
    res.status(500).json({ message: "Failed to load invoices." });
  }
});

router.post("/preview", auth, async (req, res) => {
  try {
    const data = getInvoiceInput(req.body);
    const pdf = await generatePDF({
      ...data,
      invoiceNo: "PREVIEW",
      status: "pending",
    });
    sendPdf(res, pdf, "PREVIEW");
  } catch (err) {
    const status = err instanceof InvoiceInputError ? 400 : 500;
    if (status === 500) console.error("Invoice preview error:", err.message);
    res.status(status).json({ message: status === 400 ? err.message : "Failed to generate invoice preview." });
  }
});

router.post("/download", auth, async (req, res) => {
  try {
    const data = getInvoiceInput(req.body);
    const latestInvoice = await Invoice.findOne({ userId: req.user.id })
      .sort({ invoiceNo: -1 })
      .select("invoiceNo")
      .lean();

    let invoiceNo = (latestInvoice?.invoiceNo || 1000) + 1;
    let invoice;
    let pdf;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      pdf = await generatePDF({ ...data, invoiceNo, status: "pending" });
      try {
        invoice = await Invoice.create({
          ...data,
          userId: req.user.id,
          invoiceNo,
          status: "pending",
        });
        break;
      } catch (err) {
        if (err.code !== 11000 || attempt === 2) throw err;
        const latest = await Invoice.findOne({ userId: req.user.id })
          .sort({ invoiceNo: -1 })
          .select("invoiceNo")
          .lean();
        invoiceNo = (latest?.invoiceNo || invoiceNo) + 1;
      }
    }

    if (!invoice || !pdf?.length) {
      throw new Error("Invoice could not be saved or generated.");
    }

    let driveUploaded = false;
    if (req.body.uploadToDrive) {
      try {
        await uploadToDrive(req.user.id, pdf, invoiceNo);
        driveUploaded = true;
      } catch (err) {
        console.error("Invoice Drive upload error:", err.message);
      }
    }

    res.set("X-Drive-Uploaded", String(driveUploaded));
    sendPdf(res, pdf, invoice.invoiceNo);
  } catch (err) {
    const status = err instanceof InvoiceInputError ? 400 : 500;
    if (status === 500) console.error("Invoice generation error:", err.message);
    res.status(status).json({ message: status === 400 ? err.message : "Failed to generate and save invoice." });
  }
});

router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (!VALID_STATUSES.has(req.body.status)) {
      return res.status(400).json({ message: "Status must be paid or pending." });
    }
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    ).select("-__v -userId");
    if (!invoice) return res.status(404).json({ message: "Invoice not found." });
    res.json(invoice);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json({ message: "Invoice not found." });
    console.error("Invoice status update error:", err.message);
    res.status(500).json({ message: "Failed to update invoice status." });
  }
});

router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!invoice) return res.status(404).json({ message: "Invoice not found." });
    const pdf = await generatePDF(invoice);
    sendPdf(res, pdf, invoice.invoiceNo);
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json({ message: "Invoice not found." });
    console.error("Invoice PDF download error:", err.message);
    res.status(500).json({ message: "Failed to download invoice." });
  }
});

module.exports = router;
