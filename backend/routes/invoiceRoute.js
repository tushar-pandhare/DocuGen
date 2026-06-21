const express = require("express");
const router = express.Router();
const generatePDF = require("../utils/generatePDF");
const auth = require("../middleware/authMiddleware");
const Invoice = require("../models/InvoiceSchema");
const { drive, oauth2Client } = require("../utils/googleDrive");
const User = require("../models/user");
const { Readable } = require("stream");

async function generateInvoiceNumber(userId) {
  const lastInvoice = await Invoice.findOne({ userId }).sort({ invoiceNo: -1 });
  return lastInvoice ? lastInvoice.invoiceNo + 1 : 1001;
}

router.put("/rename-file/:fileId", auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user.googleTokens) return res.status(400).json({ message: "Google not connected" });
    oauth2Client.setCredentials(user.googleTokens);
    await drive.files.update({ fileId, requestBody: { name: newName } });
    res.json({ message: "File renamed successfully" });
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ message: "Failed to rename file" });
  }
});

router.post("/download", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const uploadToDrive = req.body.uploadToDrive || false;
    const lastInvoice = await Invoice.findOne({ userId }).sort({ invoiceNo: -1 });
    const newInvoiceNo = lastInvoice ? lastInvoice.invoiceNo + 1 : 1001;
    const subtotal = req.body.total || 0;
    const gst = subtotal * 0.18;
    const invoiceData = {
      userId, invoiceNo: newInvoiceNo,
      client: req.body.client || "N/A",
      clientEmail: req.body.clientEmail || "",
      clientPhone: req.body.clientPhone || "",
      company: req.body.company || "DocuGen Inc.",
      date: new Date().toLocaleDateString("en-IN"),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
      items: req.body.items || [],
      subtotal, gst, total: subtotal + gst,
    };
    const pdf = await generatePDF(invoiceData);
    if (!pdf || pdf.length === 0) throw new Error("PDF generation returned empty data");
    await Invoice.create(invoiceData);
    let driveUploaded = false;
    if (uploadToDrive) {
      try {
        const user = await User.findById(userId);
        if (user?.googleTokens) {
          oauth2Client.setCredentials(user.googleTokens);
          const folderQuery = await drive.files.list({
            q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: "files(id, name)",
          });
          let folderId;
          if (folderQuery.data.files.length === 0) {
            const folder = await drive.files.create({ requestBody: { name: "DocuGen", mimeType: "application/vnd.google-apps.folder" } });
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
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=INVOICE-${newInvoiceNo}.pdf`,
      "Content-Length": pdf.length,
      "X-Drive-Uploaded": driveUploaded.toString(),
    });
    res.send(pdf);
  } catch (err) {
    console.error("Invoice Error:", err);
    res.status(500).json({ error: "Invoice generation failed", details: err.message });
  }
});

router.post("/preview", auth, async (req, res) => {
  try {
    const subtotal = Number(req.body.total) || 0;
    const gst = subtotal * 0.18;
    const previewData = {
      invoiceNo: req.body.invoiceNo || "PREVIEW",
      client: req.body.client || "N/A",
      clientEmail: req.body.clientEmail || "",
      clientPhone: req.body.clientPhone || "",
      company: req.body.company || "DocuGen Inc.",
      date: new Date().toLocaleDateString("en-IN"),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
      items: req.body.items || [],
      subtotal, gst, total: subtotal + gst,
    };
    const pdf = await generatePDF(previewData);
    if (!pdf || pdf.length === 0) throw new Error("PDF generation returned empty data");
    res.set({ "Content-Type": "application/pdf", "Content-Disposition": "inline; filename=preview.pdf", "Content-Length": pdf.length });
    res.send(pdf);
  } catch (err) {
    console.error("Preview Error:", err);
    res.status(500).json({ error: "Preview failed", details: err.message });
  }
});

router.get("/my-invoices", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

router.get("/test-pdf", auth, async (req, res) => {
  try {
    const testData = {
      invoiceNo: "TEST001", client: "Test Client", clientEmail: "test@example.com",
      clientPhone: "1234567890", company: "Test Company",
      date: new Date().toLocaleDateString("en-IN"),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
      items: [{ name: "Test Item", qty: 1, price: 1000 }],
      subtotal: 1000, gst: 180, total: 1180,
    };
    const pdf = await generatePDF(testData);
    res.set({ "Content-Type": "application/pdf", "Content-Disposition": "inline; filename=test.pdf", "Content-Length": pdf.length });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
