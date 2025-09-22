require("dotenv").config();
const { sendMail } = require("./api/utils/mailer"); // 👈 ruta corregida

(async () => {
  try {
    await sendMail({
      to: "logisticalic123@gmail.com", // 👈 PON AQUÍ TU CORREO REAL
      subject: "🔑 Prueba de Gmail SMTP",
      html: "<h1>Correo de prueba enviado desde tu backend ✅</h1>",
    });
    console.log("📩 Correo de prueba enviado con éxito");
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
  }
})();
