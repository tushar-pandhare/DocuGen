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

    // Get uploadToDrive preference from request body
    const uploadToDrive = req.body.uploadToDrive === 'true' || req.body.uploadToDrive === true;
    
    console.log('Upload to Drive preference:', uploadToDrive);

    const user = await User.findById(req.user.id);
    
    const doc = new PDFDocument({ autoFirstPage: false });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      
      let driveFile = null;
      let folderId = null;

      // Only upload to Drive if user selected the option AND has Google connected
      if (uploadToDrive && user.googleTokens) {
        try {
          const oauthClient = setCredentials(user.googleTokens);
          folderId = await createDocuGenFolder(oauthClient);
          const fileName = `MultiImagePDF_${Date.now()}.pdf`;
          driveFile = await uploadInvoice(oauthClient, folderId, pdfBuffer, fileName);
          console.log('PDF uploaded to Google Drive');
        } catch (driveErr) {
          console.error("Drive upload failed:", driveErr);
          // Don't fail the request if Drive upload fails
        }
      }

      res.json({
        message: "PDF created successfully",
        file: driveFile,
        pdfBase64: pdfBuffer.toString("base64"),
        fileName: `MultiImagePDF_${Date.now()}.pdf`,
        uploadedToDrive: uploadToDrive && !!driveFile
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
// const express = require("express");
// const multer = require("multer");
// const PDFDocument = require("pdfkit");
// const auth = require("../middleware/authMiddleware");
// const User = require("../models/user");

// const {
//   setCredentials,
//   createDocuGenFolder,
//   uploadInvoice,
// } = require("../utils/googleDrive");

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// router.post("/img", auth, upload.array("images"), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No images uploaded" });
//     }

//     const user = await User.findById(req.user.id);
//     if (!user.googleTokens) {
//       return res.status(400).json({ message: "Google not connected" });
//     }

//     const doc = new PDFDocument({ autoFirstPage: false });
//     const buffers = [];

//     doc.on("data", buffers.push.bind(buffers));

//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(buffers);

//       const oauthClient = setCredentials(user.googleTokens);
//       const folderId = await createDocuGenFolder(oauthClient);

//       const fileName = `MultiImagePDF_${Date.now()}.pdf`;

//       const driveFile = await uploadInvoice(
//         oauthClient,
//         folderId,
//         pdfBuffer,
//         fileName
//       );

//       res.json({
//         message: "PDF created successfully",
//         file: driveFile,
//         pdfBase64: pdfBuffer.toString("base64"),
//         fileName,
//       });
//     });

//     /* ================= ADD EACH IMAGE AS NEW PAGE ================= */
//     req.files.forEach((file) => {
//       doc.addPage();
//       doc.image(file.buffer, {
//         fit: [500, 700],
//         align: "center",
//         valign: "center",
//       });
//     });

//     doc.end();
//   } catch (err) {
//     console.error("Multi image error:", err);
//     res.status(500).json({ message: "Failed to create PDF" });
//   }
// });

// module.exports = router;