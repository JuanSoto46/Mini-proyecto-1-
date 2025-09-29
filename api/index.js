const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow Postman, curl, healthchecks
    
      /^http:\/\/localhost:\d+$/.test(origin) || // ✅ any port on localhost
      origin.endsWith(".vercel.app")         || // ✅ any domain on Vercel
      origin.endsWith(".onrender.com")          // ✅ your backend on Render
    ) {
      return cb(null, true);
    }
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));

// Test route
app.get("/", (_req, res) => res.send("Server is running"));

// API routes
const routes = require("./routes/routes.js");
app.use("/api/v1", routes);

// DB connection
const { connectDB } = require("./config/database");

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en .env");
  await connectDB();

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

// 👇 now we properly close and call the function
start().catch((err) => {
  console.error("❌ Failed to start:", err.message);
  process.exit(1);
});
