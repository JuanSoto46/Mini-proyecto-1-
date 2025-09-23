const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // permite Postman, curl, healthchecks
    if (
      /^http:\/\/localhost:\d+$/.test(origin) || // ✅ cualquier puerto en localhost
      origin.endsWith(".vercel.app")         || // ✅ cualquier dominio de Vercel
      origin.endsWith(".onrender.com")          // ✅ tu backend en Render
    ) {
      return cb(null, true);
    }
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));

// Ruta de prueba
app.get("/", (_req, res) => res.send("Server is running"));

// Rutas de la API
const routes = require("./routes/routes.js");
app.use("/api/v1", routes);

// Conexión DB
const { connectDB } = require("./config/database");

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en .env");
  await connectDB();

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

// 👇 ahora sí cerramos bien y llamamos la función
start().catch((err) => {
  console.error("❌ Failed to start:", err.message);
  process.exit(1);
});
