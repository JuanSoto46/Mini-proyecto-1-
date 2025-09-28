/**
 * @file Controlador de usuarios.
 */
const bcrypt = require("bcryptjs");
const User = require("../models/User");
// const Task = require("../models/Task"); // si vas a borrar también tareas del usuario, descomenta

module.exports = {
  /** Listar usuarios (campos públicos) */
  async list(_req, res) {
    const users = await User.find({}, "firstName lastName email age createdAt");
    res.json(users);
  },

  /** Perfil del usuario autenticado */
  async me(req, res) {
    const u = await User.findById(req.userId, "firstName lastName email age createdAt");
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(u);
  },

  /** ➕ Actualizar perfil propio */
  async updateMe(req, res) {
    try {
      const userId = req.userId;
      const { firstName, lastName, age, email, password } = req.body || {};

      const updates = {};
      if (typeof firstName === "string") updates.firstName = firstName.trim();
      if (typeof lastName  === "string") updates.lastName  = lastName.trim();
      if (typeof age       !== "undefined") updates.age    = Number(age);

      if (typeof email === "string") {
        const newEmail = String(email).toLowerCase().trim();
        // Evitar duplicados de email
        const exists = await User.findOne({ email: newEmail, _id: { $ne: userId } });
        if (exists) return res.status(409).json({ message: "Email ya está en uso" });
        updates.email = newEmail;
      }

      // Cambio de contraseña desde el perfil (opcional)
      if (typeof password === "string" && password.length > 0) {
        if (password.length < 6) {
          return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }
        updates.passwordHash = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No hay campos para actualizar" });
      }

      const updated = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, projection: "firstName lastName email age createdAt" }
      );
      if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  /** ➖ Eliminar cuenta propia */
  async deleteMe(req, res) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: "No autenticado" });

      // Opcional: limpia datos relacionados del usuario
      // await Task.deleteMany({ userId });

      const deleted = await User.findByIdAndDelete(userId);
      if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });

      return res.json({ message: "Cuenta eliminada exitosamente" });
    } catch (err) {
      console.error("deleteMe error:", err);
      return res.status(500).json({ message: "Error al eliminar la cuenta" });
    }
  }
};

