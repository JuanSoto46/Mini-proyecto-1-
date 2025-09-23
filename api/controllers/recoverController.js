// controllers/recoverController.js
const crypto = require("crypto");
const { sendMail } = require("../api/utils/mailer");
const User = require("../models/User"); // Asegúrate de tener tu modelo de usuario
const Token = require("../models/Token"); // Opcional: si guardas tokens para expiración

async function recoverUser(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "El correo es requerido" });

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    // Generar token seguro
    const token = crypto.randomBytes(32).toString("hex");
    
    // Guardar token en BD o actualizarlo si ya existe (opcional)
    await Token.findOneAndUpdate(
      { userId: user._id },
      { token, createdAt: Date.now() },
      { upsert: true }
    );

    // Construir link de recuperación apuntando al frontend en Vercel
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendBase}/#/recover?token=${token}&email=${encodeURIComponent(email)}`;

    console.log("Enviando correo de recuperación a:", email, "Link:", resetLink);

    // Enviar correo
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

