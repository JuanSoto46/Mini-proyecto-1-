const express = require("express");
const router = express.Router();
const { authRequired } = require("../middlewares/auth");
const UserController = require("../controllers/UserController");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Proteger endpoints con JWT
router.get("/", authRequired, UserController.list);
router.get("/me", authRequired, UserController.me);

// Update current user's profile
router.put("/me", authRequired, async (req, res) => {
  try {
    const { firstName, lastName, age, email, password } = req.body || {};
    const update = {};
    if (firstName != null) update.firstName = String(firstName).trim();
    if (lastName  != null) update.lastName  = String(lastName).trim();
    if (age       != null) update.age       = Number(age);
    if (email     != null) update.email     = String(email).toLowerCase().trim();
    if (password  != null && String(password).length >= 6) {
      update.passwordHash = await bcrypt.hash(String(password), 10);
    }

    // evitar duplicado de email
    if (update.email) {
      const dupe = await User.findOne({ _id: { $ne: req.userId }, email: update.email });
      if (dupe) return res.status(400).json({ message: "El email ya está registrado" });
    }

    const saved = await User.findByIdAndUpdate(
      req.userId,
      update,
      { new: true, runValidators: true, fields: "firstName lastName email age createdAt" }
    );
    if (!saved) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;