// api/middlewares/auth.js
const jwt = require("jsonwebtoken");
const BEARER = /^Bearer\s+(.+)$/i;

function authRequired(req, res, next) {
  try {
    if (req.method === "OPTIONS") return res.sendStatus(200);
    const h = req.headers.authorization || "";
    const m = h.match(BEARER);
    if (!m) return res.status(401).json({ message: "Missing token" });

    const token = m[1].trim();
    const secret = process.env.JWT_SECRET || "dev";
    const payload = jwt.verify(token, secret);

    req.userId = payload.sub || payload.id || payload._id;
    req.user = { id: req.userId, email: payload.email };
    next();
  } catch (err) {
    // Logging útil para depurar
    console.error("[JWT] verify failed:", err?.name, "-", err?.message);
    const msg = err?.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message: msg });
  }
}

module.exports = { authRequired };
