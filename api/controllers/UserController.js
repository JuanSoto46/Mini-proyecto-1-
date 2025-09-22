/**
 * @file Controlador de usuarios.
 */
const User = require("../models/User");

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
  }
};
