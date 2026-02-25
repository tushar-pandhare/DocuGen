const express = require("express");
const router = express.Router();
const generatePDF = require("../utils/generatePDF");
const auth = require("../middleware/authMiddleware");
const Invoice = require("../models/InvoiceSchema");
const { drive, oauth2Client , uploadInvoice,
  createDocuGenFolder,
  listFiles,
  renameFile,
  setCredentials } = require("../utils/googleDrive");
const User = require("../models/user");

const { Readable } = require("stream");

router.post("/download", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔹 Get last invoice number
    const lastInvoice = await Invoice.findOne({ userId }).sort({
      invoiceNo: -1,
    });

    const newInvoiceNo = lastInvoice ? lastInvoice.invoiceNo + 1 : 1;

    // 🔹 Prepare invoice data
    const invoiceData = {
      userId,
      invoiceNo: newInvoiceNo,
      client: req.body.client,
      date: req.body.date,
      items: req.body.items,
      total: req.body.total,
    };

    // 🔹 Save to DB
    await Invoice.create(invoiceData);

    // 🔹 Generate PDF (Buffer)
    const pdf = await generatePDF(invoiceData);

    // 🔹 Get user Google tokens
    const user = await User.findById(userId);

    if (!user || !user.googleTokens) {
      return res.status(400).json({
        error: "Google Drive not connected",
      });
    }

    oauth2Client.setCredentials(user.googleTokens);

    // 🔹 Convert Buffer → Readable Stream (IMPORTANT FIX)
    const bufferStream = new Readable();
    bufferStream.push(pdf);
    bufferStream.push(null);

    // 🔹 Check if DocuGen folder exists
    const folderQuery = await drive.files.list({
      q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });

    let folderId;

    if (folderQuery.data.files.length === 0) {
      const folder = await drive.files.create({
        requestBody: {
          name: "DocuGen",
          mimeType: "application/vnd.google-apps.folder",
        },
      });
      folderId = folder.data.id;
    } else {
      folderId = folderQuery.data.files[0].id;
    }

    // 🔹 Upload to Google Drive
    await drive.files.create({
      requestBody: {
        name: `invoice-${newInvoiceNo}.pdf`,
        parents: [folderId],
      },
      media: {
        mimeType: "application/pdf",
        body: bufferStream, // ✅ FIXED
      },
    });

    // 🔹 Send PDF to frontend
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${newInvoiceNo}.pdf`,
    });

    res.send(pdf);
  } catch (err) {
    console.error("Invoice Error:", err);
    res.status(500).json({ error: "Invoice generation failed" });
  }
});

/**
 * 📌 Preview Invoice (No DB Save)
 */
router.post("/preview", auth, async (req, res) => {
  try {
    const pdf = await generatePDF(req.body);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=preview.pdf",
    });

    return res.send(pdf);
  } catch (err) {
    console.error("Preview Error:", err);
    return res.status(500).json({ error: "Preview failed" });
  }
});

/**
 * 📌 Get All Invoices of Logged-in User
 */
router.get("/my-invoices", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    return res.json(invoices);
  } catch (err) {
    console.error("Fetch Invoices Error:", err);
    return res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

/**
 * 📌 Delete Invoice
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    return res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Delete Invoice Error:", err);
    return res.status(500).json({ error: "Delete failed" });
  }
});
router.get("/drive-files", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user || !user.googleTokens) {
      return res.status(400).json({
        error: "Google Drive not connected",
      });
    }

    oauth2Client.setCredentials(user.googleTokens);

    // Find DocuGen folder
    const folderQuery = await drive.files.list({
      q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });

    if (folderQuery.data.files.length === 0) {
      return res.json([]);
    }

    const folderId = folderQuery.data.files[0].id;

    // Get files inside folder
    // const files = await drive.files.list({
    //   q: `'${folderId}' in parents and trashed=false`,
    //   fields: "files(id, name, webViewLink, createdTime, size)",
    //   orderBy: "createdTime desc",
    // });

    const files = await drive.files.list({
  q: `'${folderId}' in parents and trashed=false`,
  fields: "files(id, name, webViewLink, createdTime)",
});

    res.json(files.data.files);
  } catch (err) {
    console.error("Drive Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch Drive files" });
  }
});

// rename file
router.put("/rename-file/:fileId", auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newName } = req.body;

    const user = await User.findById(req.user.id);

    if (!user.googleTokens) {
      return res.status(400).json({ message: "Google not connected" });
    }

    const oauthClient = setCredentials(user.googleTokens);

    const updatedFile = await renameFile(oauthClient, fileId, newName);

    res.json(updatedFile);
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ message: "Failed to rename file" });
  }
});

module.exports = router;
