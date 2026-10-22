const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const { signupRules, loginRules } = require("../middleware/validateInput");
const router = express.Router();

router.post("/signup", authLimiter, signupRules, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", authLimiter, loginRules, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const { getCache, setCache } = require("../utils/redis");

router.get("/me", auth, async (req, res) => {
  try {
    const cacheKey = `cache:user:${req.user.id}`;
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) {
      return res.json(cachedUser);
    }

    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      await setCache(cacheKey, user, 300); // 5-minute TTL
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;
