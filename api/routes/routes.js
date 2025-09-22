const express = require("express");
const { authRequired } = require("../middlewares/auth");
const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes);                  // público: login/register/recover
router.use("/tasks", authRequired, taskRoutes);   // protegido
router.use("/users", authRequired, userRoutes);   // protegido

module.exports = router;

