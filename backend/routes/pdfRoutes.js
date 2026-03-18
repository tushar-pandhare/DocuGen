// const express = require("express");
// const router = express.Router();
// const puppeteer = require("puppeteer");
// const upload = require("../utils/multer");
// const auth = require("../middleware/authMiddleware")
// const User = require("../models/user")
// const PDFDocument = require("pdfkit");
// const {
//   setCredentials,
//   createDocuGenFolder,
//   uploadInvoice, 
// } = require("../utils/googleDrive");
// router.post("/img", auth, upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No image uploaded" });
//     }

//     const user = await User.findById(req.user.id);

//     if (!user.googleTokens) {
//       return res.status(400).json({ message: "Google not connected" });
//     }

//     /* ================= CREATE PDF FROM IMAGE ================= */
//     const doc = new PDFDocument();
//     const buffers = [];

//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(buffers);

//       /* ================= GOOGLE DRIVE UPLOAD ================= */
//       const oauthClient = setCredentials(user.googleTokens);

//       const folderId = await createDocuGenFolder(oauthClient);

//       const fileName = `ImagePDF_${Date.now()}.pdf`;

//       const driveFile = await uploadInvoice(
//         oauthClient,
//         folderId,
//         pdfBuffer,
//         fileName
//       );

//       res.json({
//         message: "PDF uploaded to Drive successfully",
//         file: driveFile,
//         pdfBase64: pdfBuffer.toString("base64"),
//         fileName,
//       });
//     });

//     doc.image(req.file.buffer, {
//       fit: [500, 700],
//       align: "center",
//       valign: "center",
//     });

//     doc.end();
//   } catch (err) {
//     console.error("Image to PDF error:", err);
//     res.status(500).json({ message: "Failed to convert & upload" });
//   }
// });

// module.exports = router;

const express = require("express");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const auth = require("../middleware/authMiddleware");
const User = require("../models/user");

const {
  setCredentials,
  createDocuGenFolder,
  uploadInvoice,
} = require("../utils/googleDrive");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/img", auth, upload.array("images"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user.googleTokens) {
      return res.status(400).json({ message: "Google not connected" });
    }

    const doc = new PDFDocument({ autoFirstPage: false });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const oauthClient = setCredentials(user.googleTokens);
      const folderId = await createDocuGenFolder(oauthClient);

      const fileName = `MultiImagePDF_${Date.now()}.pdf`;

      const driveFile = await uploadInvoice(
        oauthClient,
        folderId,
        pdfBuffer,
        fileName
      );

      res.json({
        message: "PDF created successfully",
        file: driveFile,
        pdfBase64: pdfBuffer.toString("base64"),
        fileName,
      });
    });

    /* ================= ADD EACH IMAGE AS NEW PAGE ================= */
    req.files.forEach((file) => {
      doc.addPage();
      doc.image(file.buffer, {
        fit: [500, 700],
        align: "center",
        valign: "center",
      });
    });

    doc.end();
  } catch (err) {
    console.error("Multi image error:", err);
    res.status(500).json({ message: "Failed to create PDF" });
  }
});

module.exports = router;