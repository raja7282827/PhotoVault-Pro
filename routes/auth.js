const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, confirm } = req.body;
    if (!username || !email || !password || !confirm) return res.status(400).send("All fields required");
    if (password !== confirm) return res.status(400).send("Passwords do not match!");

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).send("Email already registered");

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    req.session.userId = user._id;
    res.redirect("/gallery.html");
  } catch (e) {
    console.error(e);
    res.status(500).send("Signup error");
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found!");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).send("Invalid password!");

    req.session.userId = user._id;
    res.redirect("/gallery.html");
  } catch (e) {
    console.error(e);
    res.status(500).send("Login error");
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

// Current user
router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  const me = await User.findById(req.session.userId).select("username email");
  res.json(me);
});

module.exports = router;
