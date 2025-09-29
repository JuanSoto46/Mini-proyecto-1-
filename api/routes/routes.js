const express = require("express");
const { authRequired } = require("../middlewares/auth");
const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes);                  // públic: login/register/recover
router.use("/tasks", authRequired, taskRoutes);   // protected
router.use("/users", authRequired, userRoutes);   // protected

module.exports = router;

