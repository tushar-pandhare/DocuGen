const express = require("express");
const router = express.Router();
const { oauth2Client } = require("../utils/googleDrive");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

router.get("/google", auth, (req, res) => {
  try {
    const userId = req.user.id; // ✅ get from JWT

    // const url = oauth2Client.generateAuthUrl({
    //   access_type: "offline",
    //   prompt: "consent",
    //   scope: [
    //     "https://www.googleapis.com/auth/drive.file",
    //   ],
    //   state: userId, // pass userId safely
    // });
    const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent select_account", // add select_account too
  scope: [
    "https://www.googleapis.com/auth/drive.file",
  ],
  state: userId,
  include_granted_scopes: false, // don't carry over previously granted scopes
});
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google auth failed" });
  }
});
// router.get("/google/callback", async (req, res) => {
//   try {
//     const { code, state } = req.query;

//     if (!state) {
//       return res.status(400).send("User ID missing in state");
//     }

//     const { tokens } = await oauth2Client.getToken(code);

//     await User.findByIdAndUpdate(state, {
//       googleTokens: tokens,
//     });

//     res.redirect("http://localhost:5173/");
//   } catch (err) {
//     console.error("Google Callback Error:", err);
//     res.status(500).send("Google Auth Failed");
//   }
// });
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    // Handle user denial
    if (error) {
      return res.redirect("http://localhost:5173/?drive_error=access_denied");
    }

    if (!state) {
      return res.status(400).send("User ID missing in state");
    }

    const { tokens } = await oauth2Client.getToken(code);

    // Verify the token actually has drive scope
    if (!tokens.access_token) {
      return res.redirect("http://localhost:5173/?drive_error=no_token");
    }

    await User.findByIdAndUpdate(state, {
      googleTokens: tokens,
    });

    res.redirect("http://localhost:5173/?drive_connected=true");
  } catch (err) {
    console.error("Google Callback Error:", err);
    res.redirect("http://localhost:5173/?drive_error=failed");
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
