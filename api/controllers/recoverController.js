// controllers/recoverController.js
const { sendMail } = require("../api/utils/mailer");

async function recoverUser(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "El correo es requerido" });
    }

    // Aquí podrías validar en la BD si existe el usuario
    // const user = await User.findOne({ email });
    // if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    await sendMail({
      to: email,
      subject: "🔑 Recuperación de contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password">Restablecer contraseña</a>
      `,
    });

    res.json({ msg: "📩 Correo de recuperación enviado con éxito" });
  } catch (err) {
    console.error("❌ Error en recoverUser:", err);
    res.status(500).json({ msg: "Error al enviar correo" });
  }
}

module.exports = { recoverUser };
