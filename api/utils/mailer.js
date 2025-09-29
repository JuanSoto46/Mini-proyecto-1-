/**
 * @file mailer.js
 * @description Utilidad para enviar correos usando SendGrid API (HTTP, no SMTP)
 */
const sgMail = require('@sendgrid/mail');

// Configurar API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Enviar un correo
 * @param {Object} options
 * @param {string} options.to - Correo destino
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.html - Contenido HTML
 */
async function sendMail({ to, subject, html }) {
  try {
    const msg = {
      to,
      from: process.env.MAIL_FROM, // debe estar verificado en SendGrid
      subject,
      html,
    };
    const res = await sgMail.send(msg);
    console.log('📩 Correo enviado con SendGrid:', res[0].statusCode);
    return res;
  } catch (err) {
  if (err.response) {
    console.error("❌ Error enviando correo con SendGrid:", err.response.body.errors);
  } else {
    console.error("❌ Error inesperado:", err);
  }
  throw err;
}
}

module.exports = { sendMail };

