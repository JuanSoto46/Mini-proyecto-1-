/**
 * @file auth.js
 * @description JWT authentication middleware.
 */

const jwt = require("jsonwebtoken");

/**
 * Validate Bearer token and attach req.userId.
 */
function authRequired(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const [, token] = hdr.split(" ");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");
    req.userId = decoded.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { authRequired };