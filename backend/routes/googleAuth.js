const express = require("express");
const router = express.Router();
const { oauth2Client } = require("../utils/googleDrive");
const User = require("../models/user");

// STEP 1: Redirect to Google
router.get("/google", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send("User ID is required");
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    state: userId, // send userId safely
  });

  res.redirect(url);
});

// STEP 2: Callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!state) {
      return res.status(400).send("User ID missing in state");
    }

    const { tokens } = await oauth2Client.getToken(code);

    await User.findByIdAndUpdate(state, {
      googleTokens: tokens,
    });

    res.redirect("http://localhost:5173/");
  } catch (err) {
    console.error("Google Callback Error:", err);
    res.status(500).send("Google Auth Failed");
  }
});

module.exports = router;
