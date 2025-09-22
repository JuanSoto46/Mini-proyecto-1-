// api/utils/mailer.js
let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch {
  // sin paquete: seguiremos con modo consola
}

/**
 * Crea un transporte SMTP real si hay variables,
 * o usa modo consola (streamTransport) en dev si falta configuración/paquete.
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // Si no hay nodemailer por alguna razón, modo consola
  if (!nodemailer) {
    return {
      // transporte fake compatible
      async sendMail({ from, to, subject, html }) {
        console.log("=== CORREO (DEV, sin nodemailer) ===");
        console.log("From:", from);
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log(html);
        console.log("=== FIN CORREO ===");
        return { messageId: "dev-no-nodemailer" };
      }
    };
  }

  // Si faltan variables SMTP, usa streamTransport para mostrar en consola
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
      newline: "unix"
    });
  }

  // Transporte real
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // 465 SSL, 587 STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // logger: true, debug: true, // descomenta para ver el tráfico SMTP
  });
}

async function sendMail({ to, subject, html }) {
  const from = process.env.MAIL_FROM || "no-reply@example.com";
  const tx = createTransporter();
  const info = await tx.sendMail({ from, to, subject, html });
  // Si es streamTransport, loguea el contenido
  if (tx.options?.streamTransport) {
    console.log("=== CORREO (DEV, stream) ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(html);
    console.log("=== FIN CORREO ===");
  }
  return info;
}

module.exports = { sendMail };
