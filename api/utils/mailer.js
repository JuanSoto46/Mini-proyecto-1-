/**
 * @file mailer.js
 * @description Utility to send emails using SendGrid API (HTTP, not SMTP)
 */
const sgMail = require('@sendgrid/mail');

// Configurar API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 */
async function sendMail({ to, subject, html }) {
  try {
    const msg = {
      to,
      from: process.env.MAIL_FROM, // must be verified in SendGrid
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

