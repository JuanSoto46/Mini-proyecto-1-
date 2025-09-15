const express = require("express");
const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");
const userRoutes = require("./userRoutes"); // opcional

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes); // si quieres dejarlo

module.exports = router;
