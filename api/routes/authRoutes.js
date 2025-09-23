/**
 * @file authRoutes.js
 * @description Rutas de autenticación: registro, login y recuperación de contraseña.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

/**
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, age, email, password } = req.body || {};
    if (!firstName || !lastName || !age || !email || !password) {
      return res.status(400).json({ message: "Faltan campos" });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: "Email ya registrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      firstName,
      lastName,
      age,
      email: String(email).toLowerCase().trim(),
      passwordHash,
    });

    res.status(201).json({ ok: true, message: "Usuario registrado" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Credenciales incompletas" });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || "dev",
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * POST /auth/forgot-password
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Email requerido" });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.json({ ok: true }); // no revelar si existe

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1h
    await user.save();

    const base = process.env.FRONTEND_URL || "http://localhost:5173";
    const link = `${base}/#/recover?token=${token}&email=${encodeURIComponent(email)}`;

    const html = `
      <div style="font-family:system-ui">
        <h2>Restablecer contraseña</h2>
        <p>Haz clic en el botón para crear una nueva contraseña (expira en 1 hora).</p>
        <p><a href="${link}" 
              style="background:#4f46e5;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">
              Restablecer contraseña
           </a></p>
      </div>`;

    await sendMail({ to: email, subject: "Restablecer contraseña", html });

    res.json({ ok: true, message: "Correo enviado" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * POST /auth/reset-password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, password } = req.body || {};
    if (!email || !token || !password) return res.status(400).json({ message: "Faltan campos" });

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ ok: true, message: "Contraseña actualizada" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * POST /auth/change-password
 * Requiere token. Body: { currentPassword, newPassword }
 */
const { authRequired } = require("../middlewares/auth");
router.post("/change-password", authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Faltan campos" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash || "");
    if (!ok) return res.status(400).json({ message: "Contraseña actual incorrecta" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ ok: true, message: "Contraseña actualizada" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
