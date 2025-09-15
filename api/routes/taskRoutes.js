/**
 * @file taskRoutes.js
 * @description Task endpoints using GET/POST only. Require JWT.
 */

const express = require("express");
const Task = require("../models/Task");
const { authRequired } = require("../middlewares/auth");

const router = express.Router();

// GET /tasks -> list by user
router.get("/", authRequired, async (req, res) => {
  const items = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(items);
});

// POST /tasks -> create
router.post("/", authRequired, async (req, res) => {
  const { title, detail = "", date, time, status = "todo" } = req.body || {};
  if (!title || !date || !time || !status) return res.status(400).json({ message: "Missing fields" });
  const created = await Task.create({ userId: req.userId, title, detail, date, time, status });
  res.status(201).json(created);
});

// POST /tasks/:id/status -> update status
router.post("/:id/status", authRequired, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: "Missing status" });
  const updated = await Task.findOneAndUpdate({ _id: id, userId: req.userId }, { status }, { new: true });
  if (!updated) return res.status(404).json({ message: "Task not found" });
  res.json(updated);
});

// POST /tasks/:id/delete -> delete
router.post("/:id/delete", authRequired, async (req, res) => {
  const { id } = req.params;
  const del = await Task.deleteOne({ _id: id, userId: req.userId });
  if (del.deletedCount === 0) return res.status(404).json({ message: "Task not found" });
  res.json({ ok: true });
});

module.exports = router;