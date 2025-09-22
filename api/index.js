const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const { connectDB } = require("./config/database");
const routes = require("./routes/routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS sensato: localhost, *.vercel.app y ALLOWED_ORIGINS
const allowed = new Set(
  String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // Postman/cURL/health
    if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return cb(null, true);
    }
    try {
      const host = new URL(origin).hostname;
      if (/\.vercel\.app$/.test(host)) return cb(null, true);
    } catch {}
    if (allowed.has(origin)) return cb(null, true);
    // Para producción estricta, cambia a: cb(new Error("Origin not allowed by CORS"))
    return cb(null, true);
  }
}));

// Health
app.get("/api/v1/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// API
app.use("/api/v1", routes);

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en .env");
  await connectDB();

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start:", err.message);
  process.exit(1);
});
