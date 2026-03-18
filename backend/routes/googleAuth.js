const express = require("express");
const router = express.Router();
const { oauth2Client } = require("../utils/googleDrive");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

router.get("/google", auth, (req, res) => {
  try {
    const userId = req.user.id; // ✅ get from JWT

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/drive.file",
      ],
      state: userId, // pass userId safely
    });

    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google auth failed" });
  }
});
// router.get("/google", auth, (req, res) => {
//   const userId = req.user.id;

//   const url = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: ["https://www.googleapis.com/auth/drive.file"],
//     state: userId,
//   });

//   res.json({ url });
// });

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
//     console.error(err);
//     res.status(500).send("Google Auth Failed");
//   }
// });
module.exports = router;
