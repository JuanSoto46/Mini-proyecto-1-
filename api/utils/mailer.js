/**
 * @file mailer.js
 * @description Utilidad para enviar correos usando SMTP (Gmail u otros) con manejo de errores.
 */

const nodemailer = require("nodemailer");

// Crear el transportador a partir de las variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para 587/STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Verifica que el transportador está listo
 */
transporter.verify().then(() => {
  console.log("✅ Mailer listo para enviar correos");
}).catch(err => {
  console.error("❌ Error al verificar el transportador SMTP:", err);
});

/**
 * Enviar un correo
 * @param {Object} options
 * @param {string} options.to - Correo destino
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.html - Contenido HTML
 */
async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log("📩 Correo enviado:", info.messageId);

    // Si usas Ethereal para testing, esto da la URL de preview
    if (process.env.SMTP_HOST.includes("ethereal")) {
      console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (err) {
    console.error("❌ Error enviando correo:", err);
    throw err; // lanzar para que el endpoint pueda manejarlo
  }
}

module.exports = { sendMail };
