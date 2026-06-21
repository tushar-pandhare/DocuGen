const express = require("express");
const router = express.Router();
const multer = require("multer");
const { google } = require("googleapis");
const stream = require("stream");
const auth = require("../middleware/authMiddleware");
const User = require("../models/user");

/* ================= GET DRIVE FILES (FIXED - WITH webViewLink) ================= */
router.get("/files", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user from DB
    const user = await User.findById(userId);

    if (!user || !user.googleTokens) {
      return res.status(400).json({ message: "Google Drive not connected", files: [] });
    }

    // Setup OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(user.googleTokens);

    // Create Drive instance
    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    // First, find the DocuGen folder
    const folderQuery = await drive.files.list({
      q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id, name)"
    });

    let folderId = null;
    
    if (folderQuery.data.files.length > 0) {
      folderId = folderQuery.data.files[0].id;
      
      // Get files from DocuGen folder with all necessary fields
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: "files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink)",
        orderBy: "createdTime desc",
        pageSize: 50
      });
      
      res.json({
        files: response.data.files || []
      });
    } else {
      // No DocuGen folder exists
      res.json({ files: [] });
    }

  } catch (err) {
    console.error("Drive files error:", err);
    
    if (err.message.includes("No refresh token")) {
      return res.status(401).json({
        message: "Reconnect Google Drive (No refresh token)",
        files: []
      });
    }
    
    res.status(500).json({ message: "Failed to fetch files", files: [] });
  }
});

/* ================= UPLOAD FILE ================= */
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.googleTokens) {
      return res.status(400).json({
        message: "Google Drive not connected",
      });
    }

    // Setup OAuth client
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

    // Find or create DocuGen folder
    let folderId = null;
    const folderQuery = await drive.files.list({
      q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id, name)"
    });

    if (folderQuery.data.files.length === 0) {
      // Create DocuGen folder
      const folder = await drive.files.create({
        requestBody: {
          name: "DocuGen",
          mimeType: "application/vnd.google-apps.folder"
        }
      });
      folderId = folder.data.id;
    } else {
      folderId = folderQuery.data.files[0].id;
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        parents: [folderId]
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream,
      },
      fields: 'id, name, webViewLink'
    });

    res.status(200).json(response.data);

  } catch (err) {
    console.error("Drive Upload Error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

/* ================= RENAME FILE ================= */
router.put("/rename-file/:fileId", auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newName } = req.body;
    
    if (!newName || !newName.trim()) {
      return res.status(400).json({ error: "New name is required" });
    }
    
    const user = await User.findById(req.user.id);
    if (!user || !user.googleTokens) {
      return res.status(401).json({ error: "Google Drive not connected" });
    }
    
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
    
    // Update file name in Google Drive
    const response = await drive.files.update({
      fileId: fileId,
      requestBody: {
        name: newName.trim()
      },
      fields: 'id, name, mimeType, webViewLink'
    });
    
    console.log(`File renamed: ${response.data.name}`);
    
    res.json({ 
      success: true, 
      message: "File renamed successfully",
      file: response.data 
    });
    
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ 
      error: "Failed to rename file",
      details: err.message 
    });
  }
});

/* ================= DELETE FILE ================= */
router.delete("/delete-file/:fileId", auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user || !user.googleTokens) {
      return res.status(401).json({ error: "Google Drive not connected" });
    }
    
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
    
    await drive.files.delete({
      fileId: fileId
    });
    
    res.json({ success: true, message: "File deleted successfully" });
    
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

/* ================= GET FILE INFO ================= */
router.get("/file-info/:fileId", auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user || !user.googleTokens) {
      return res.status(401).json({ error: "Google Drive not connected" });
    }
    
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
    
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink'
    });
    
    res.json({ file: file.data });
    
  } catch (err) {
    console.error("Get file info error:", err);
    res.status(500).json({ error: "Failed to get file info" });
  }
});

module.exports = router;