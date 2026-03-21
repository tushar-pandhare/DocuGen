// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const sharp = require("sharp");
// const { PDFDocument } = require("pdf-lib");

// const upload = multer({ storage: multer.memoryStorage() });

// /* ================= MULTI FILE COMPRESS ================= */
// router.post("/", upload.array("files"), async (req, res) => {
//   try {
//     const quality = parseInt(req.body.quality) || 60;

//     const results = [];

//     for (let file of req.files) {
//       let compressedBuffer;
//       let type = file.mimetype;

//       /* IMAGE */
//       if (type.startsWith("image")) {
//         compressedBuffer = await sharp(file.buffer)
//           .jpeg({ quality })
//           .toBuffer();
//       }

//       /* PDF */
//       else if (type === "application/pdf") {
//         const pdfDoc = await PDFDocument.load(file.buffer);
//         compressedBuffer = await pdfDoc.save({
//           useObjectStreams: true,
//         });
//       }

//       results.push({
//         name: file.originalname,
//         originalSize: file.size,
//         compressedSize: compressedBuffer.length,
//         base64: compressedBuffer.toString("base64"),
//         type,
//       });
//     }

//     res.json({ files: results });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Compression failed" });
//   }
// });
// // /* ================= IMAGE COMPRESS ================= */
// router.post("/image", upload.single("file"), async (req, res) => {
//   try {
//     const compressed = await sharp(req.file.buffer)
//       .jpeg({ quality: 50 }) // adjust quality (0–100)
//       .toBuffer();

//     res.set({
//       "Content-Type": "image/jpeg",
//       "Content-Disposition": "attachment; filename=compressed.jpg",
//     });

//     res.send(compressed);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Image compression failed" });
//   }
// });

// /* ================= PDF COMPRESS ================= */
// router.post("/pdf", upload.single("file"), async (req, res) => {
//   try {
//     const pdfDoc = await PDFDocument.load(req.file.buffer);

//     const compressedPdfBytes = await pdfDoc.save({
//       useObjectStreams: true,
//     });

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "attachment; filename=compressed.pdf",
//     });

//     res.send(compressedPdfBytes);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "PDF compression failed" });
//   }
// });
//   router.post("/zip", upload.array("files"), async (req, res) => {
//   const zipPath = "compressed.zip";

//   const output = fs.createWriteStream(zipPath);
//   const archive = archiver("zip");

//   archive.pipe(output);

//   req.files.forEach((file) => {
//     archive.file(file.path, { name: file.originalname });
//   });

//   await archive.finalize();

//   output.on("close", () => {
//     res.download(zipPath);
//   });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");
const { google } = require("googleapis");
const stream = require("stream");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

/* ================= GOOGLE DRIVE HELPER ================= */
async function uploadToDrive(user, fileBuffer, fileName, mimeType) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials(user.googleTokens);

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
    },
    media: {
      mimeType: mimeType,
      body: bufferStream,
    },
  });

  return response.data;
}

/* ================= MULTI FILE COMPRESS ================= */
/**
 * @route POST /api/compress
 * @desc Compress multiple files → return downloadable files OR upload to drive
 */
router.post("/", auth, upload.array("files"), async (req, res) => {
  try {
    const quality = parseInt(req.body.quality) || 60;
    const uploadDrive = req.body.uploadToDrive === "true";

    const user = await User.findById(req.user.id);

    const results = [];

    for (let file of req.files) {
      let compressedBuffer;
      let outputType = file.mimetype;
      let fileName = `compressed_${file.originalname}`;

      /* IMAGE */
      if (file.mimetype.startsWith("image")) {
        compressedBuffer = await sharp(file.buffer)
          .jpeg({ quality, progressive: true })
          .toBuffer();

        outputType = "image/jpeg";
      }

      /* PDF */
      else if (file.mimetype === "application/pdf") {
        const pdfDoc = await PDFDocument.load(file.buffer);
        const pdfBytes = await pdfDoc.save({
          useObjectStreams: true,
        });

        compressedBuffer = Buffer.from(pdfBytes);
        outputType = "application/pdf";
      }

      else continue;

      let driveFile = null;

      /* ✅ Upload to Google Drive (Optional) */
      if (uploadDrive) {
        if (!user || !user.googleTokens) {
          return res.status(400).json({
            message: "Google Drive not connected",
          });
        }

        driveFile = await uploadToDrive(
          user,
          compressedBuffer,
          fileName,
          outputType
        );
      }

      /* ✅ Prepare response */
      results.push({
        name: fileName,
        type: outputType,
        size: compressedBuffer.length,
        download: !uploadDrive
          ? `data:${outputType};base64,${compressedBuffer.toString("base64")}`
          : null,
        driveFile: driveFile, // contains fileId if uploaded
      });
    }

    res.json({ files: results });

  } catch (err) {
    console.error("Compress Error:", err);
    res.status(500).json({ message: "Compression failed" });
  }
});

module.exports = router;