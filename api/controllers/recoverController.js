// controllers/recoverController.js
const crypto = require("crypto");
const { sendMail } = require("../api/utils/mailer");
const User = require("../models/User"); // Make sure you have your User model
const Token = require("../models/Token"); // Optional: if you store tokens for expiration

async function recoverUser(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo es requerido" });

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Save token in DB or update if it already exists (optional)
    await Token.findOneAndUpdate(
      { userId: user._id },
      { token, createdAt: Date.now() },
      { upsert: true }
    );

    // Build recovery link pointing to frontend (Vercel or local)
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendBase}/#/recover?token=${token}&email=${encodeURIComponent(email)}`;

    console.log("Enviando correo de recuperación a:", email, "Link:", resetLink);

    // Send email
    await sendMail({
      to: email,
      subject: "🔑 Recuperación de contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Si no solicitaste esto, ignora este correo.</p>
      `,
    });

    res.json({ msg: "📩 Correo de recuperación enviado con éxito" });
  } catch (err) {
    console.error("❌ Error en recoverUser:", err);
    res.status(500).json({ msg: "Error al enviar correo" });
  }
}

module.exports = { recoverUser };

