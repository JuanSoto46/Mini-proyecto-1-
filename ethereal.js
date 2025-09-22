// ethereal.js (versión CommonJS)
const nodemailer = require("nodemailer");

async function main() {
  // Crear cuenta de prueba en Ethereal
  let testAccount = await nodemailer.createTestAccount();

  console.log("Credenciales de prueba generadas:");
  console.log("Usuario:", testAccount.user);
  console.log("Contraseña:", testAccount.pass);
  console.log("Host:", testAccount.smtp.host);
  console.log("Puerto:", testAccount.smtp.port);

  // Crear transporte SMTP
  let transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure, // true para 465, false para 587
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Enviar un correo de prueba
  let info = await transporter.sendMail({
    from: '"Tu App" <no-reply@example.com>',
    to: "lucia8_367@vuket.org", // destinatario real
    subject: "Recuperación de contraseña",
    text: "Haz clic en el siguiente enlace para restablecer tu contraseña.",
    html: "<b>Haz clic en el siguiente enlace para restablecer tu contraseña:</b><br><a href='http://localhost:5173/reset-password?token=12345'>Restablecer contraseña</a>",
  });

  console.log("✅ Mensaje enviado:", info.messageId);
  console.log("🔗 Vista previa URL:", nodemailer.getTestMessageUrl(info));
}

main().catch(console.error);
