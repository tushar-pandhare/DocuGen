const express = require("express");
const router = express.Router();
const { oauth2Client } = require("../utils/googleDrive");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

router.get("/google", auth, (req, res) => {
  try {
    const userId = req.user.id;

    const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/drive.file"],
  state: userId,
  include_granted_scopes: false,
});

    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google auth failed" });
  }
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/?drive_error=access_denied`);
    }

    if (!state) {
      return res.status(400).send("User ID missing in state");
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return res.redirect(`${FRONTEND_URL}/?drive_error=no_token`);
    }

    await User.findByIdAndUpdate(state, { googleTokens: tokens });

    res.redirect(`${FRONTEND_URL}/?drive_connected=true`);
  } catch (err) {
    console.error("Google Callback Error:", err);
    res.redirect(`${FRONTEND_URL}/?drive_error=failed`);
  }
});

router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.googleTokens) {
      return res.json({ connected: true });
    }
    res.json({ connected: false });
  } catch (err) {
    res.status(500).json({ connected: false });
  }
});

module.exports = router;
