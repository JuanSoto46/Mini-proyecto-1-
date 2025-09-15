const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS bien configurado
const allowlist = [
  "http://localhost:5173",
  "https://to-do-list-frontend-rkvquaue5-javy012s-projects.vercel.app"
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/healthchecks
    if (allowlist.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));


app.get("/", (_req, res) => res.send("Server is running"));

const routes = require("./routes/routes.js");
app.use("/api/v1", routes);

const { connectDB } = require("./config/database");

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en .env");
  await connectDB();

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

start().catch((err) => {
  console.error("Failed to start:", err.message);
  process.exit(1);
});
