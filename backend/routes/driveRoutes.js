const express = require("express");
const router = express.Router();
const multer = require("multer");
const { google } = require("googleapis");
const stream = require("stream");
const auth = require("../middleware/authMiddleware");
const User = require("../models/user");

/* ================= GET DRIVE FILES ================= */
router.get("/files", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔹 Get user from DB
    const user = await User.findById(userId);

    if (!user || !user.googleTokens) {
      return res.status(400).json({ message: "Google Drive not connected" });
    }

    // 🔹 Setup OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(user.googleTokens);

    // 🔹 Create Drive instance
    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    // 🔹 Fetch files
    const response = await drive.files.list({
      pageSize: 10, // you can increase this
      fields: "files(id, name, mimeType)",
    });

    res.json({
      files: response.data.files,
    });

  } catch (err) {
    console.error(err);

    // 🔴 IMPORTANT FIX for your previous error
    if (err.message.includes("No refresh token")) {
      return res.status(401).json({
        message: "Reconnect Google Drive (No refresh token)",
      });
    }

    res.status(500).json({ message: "Failed to fetch files" });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     // Note: You must have your Google Auth middleware or tokens ready here
//     const auth = new google.auth.GoogleAuth({
//       // your credentials/scopes config
//     });
//     const drive = google.drive({ version: "v3", auth: await auth.getClient() });

//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(req.file.buffer);

//     const response = await drive.files.create({
//       requestBody: {
//         name: req.file.originalname,
//         mimeType: req.file.mimetype,
//       },
//       media: {
//         mimeType: req.file.mimetype,
//         body: bufferStream,
//       },
//     });

//     res.status(200).json(response.data);
//   } catch (err) {
//     console.error("Drive Error:", err);
//     res.status(500).send("Failed to upload to Drive");
//   }
// });
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.googleTokens) {
      return res.status(400).json({
        message: "Google Drive not connected",
      });
    }

    // ✅ Use OAuth2 (NOT GoogleAuth)
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
    bufferStream.end(req.file.buffer);

    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
    });

    res.status(200).json(response.data);

  } catch (err) {
    console.error("Drive Error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;