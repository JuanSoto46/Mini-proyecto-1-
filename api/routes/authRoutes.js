/**
 * @file authRoutes.js
 * @description Authentication endpoints (POST only).
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /auth/register
 * body: { firstName, lastName, age, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, age, email, password } = req.body || {};
    if (!firstName || !lastName || !age || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ firstName, lastName, age, email: email.toLowerCase(), passwordHash });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Registration failed" });
  }
});

/**
 * POST /auth/login
 * body: { email, password } → { token }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET || "dev", { expiresIn: "2h" });
    return res.json({ token });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Login failed" });
  }
});

/**
 * POST /auth/forgot-password
 * body: { email }
 * For Sprint 1 we simulate by logging to server output.
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Missing email" });
    // Don't reveal existence to avoid user enumeration
    console.log(`[recover] If ${email} exists, a recovery link would be sent.`);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Recovery failed" });
  }
});

module.exports = router;