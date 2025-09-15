/**
 * @file Main entry point for the Express server.
 * Configures middleware, CORS, routes, and database connection.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const app = express();

/**
 * Middleware to parse JSON and URL-encoded bodies.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS configuration:
 * - Allows requests from localhost (development).
 * - Allows any subdomain of vercel.app (production).
 * - Allows tools without origin header (Postman, curl, healthchecks).
 */
app.use(cors({
  /**
   * Custom CORS origin validation.
   * @param {string|null} origin - Origin header from the request.
   * @param {function} cb - Callback to allow or block the request.
   */
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow Postman, curl, healthchecks
    if (
      origin === "http://localhost:5173" || // local development
      origin.endsWith(".vercel.app")        // any Vercel subdomain
    ) {
      return cb(null, true);
    }
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));

/**
 * Health check endpoint.
 * @route GET /
 * @returns {string} Confirmation that the server is running.
 */
app.get("/", (_req, res) => res.send("Server is running"));

/**
 * Import API routes.
 * Mounted under /api/v1
 */
const routes = require("./routes/routes.js");
app.use("/api/v1", routes);

/**
 * Import MongoDB connection utility.
 */
const { connectDB } = require("./config/database");

/**
 * Start the Express server and connect to MongoDB.
 * @async
 * @function start
 * @throws Will exit the process if MongoDB connection fails.
 */
async function start() {
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en .env");
  await connectDB();

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

/**
 * Initialize the server.
 * Handles startup errors gracefully.
 */
start().catch((err) => {
  console.error("Failed to start:", err.message);
  process.exit(1);
});

