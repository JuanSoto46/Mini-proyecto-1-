/**
 * @file authRoutes.js
 * @description Autenticación: registro, login y recuperación de contraseña.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

// Util: generar JWT
function signToken(user) {
  const payload = { sub: user._id.toString(), email: user.email };
  const secret = process.env.JWT_SECRET || "dev";
  // 7 días porque nadie quiere loguearse cada 30 minutos
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, age, email, password } = req.body || {};
    if (!firstName || !lastName || !age || !email || !password) {
      return res.status(400).json({ message: "Faltan campos" });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "Email ya registrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      age,
      email: String(email).toLowerCase().trim(),
      passwordHash
    });

    // Puedes decidir si devuelves token inmediato tras registro
    const token = signToken(user);
    res.status(201).json({
      ok: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "No se pudo registrar" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Faltan credenciales" });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = signToken(user);
    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "No se pudo iniciar sesión" });
  }
});

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Falta email" });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.json({ ok: true }); // no reveles si existe

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await user.save();

    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const url = `${appUrl}#/recover?email=${encodeURIComponent(user.email)}&token=${token}`;
    await sendMail({
      to: user.email,
      subject: "Recupera tu contraseña",
      html: `<p>Para restablecer tu contraseña, usa este enlace:</p>
             <p><a href="${url}">${url}</a></p>
             <p>Caduca en 30 minutos.</p>`
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message || "No se pudo procesar" });
  }
});

// POST /auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body || {};
    if (!email || !token || !password) return res.status(400).json({ message: "Faltan campos" });

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ ok: true, message: "Contraseña actualizada" });
  } catch (err) {
    res.status(400).json({ message: err.message || "No se pudo restablecer" });
  }
});

module.exports = router;
