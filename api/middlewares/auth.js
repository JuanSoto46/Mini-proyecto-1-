const jwt = require("jsonwebtoken");
const BEARER = /^Bearer\s+(.+)$/i;

function authRequired(req, res, next) {
  try {
    // Preflight CORS no debe autenticarse
    if (req.method === "OPTIONS") return res.sendStatus(200);

    const h = req.headers.authorization || "";
    const m = h.match(BEARER);
    if (!m) return res.status(401).json({ message: "Missing token" });

    const token = m[1].trim();
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");

    req.userId = payload.sub || payload.id || payload._id;
    req.user = { id: req.userId, email: payload.email };
    next();
  } catch (err) {
    const msg = err?.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message: msg });
  }
}

module.exports = { authRequired };
