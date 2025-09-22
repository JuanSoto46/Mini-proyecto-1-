/**
 * @file taskRoutes.js
 */
const express = require("express");
const Task = require("../models/Task");
const { authRequired } = require("../middlewares/auth");
const router = express.Router();

// GET /tasks -> tareas del usuario
router.get("/", authRequired, async (req, res) => {
  const items = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(items);
});

// POST /tasks -> crear
router.post("/", authRequired, async (req, res) => {
  const { title, detail = "", date, time, status = "todo" } = req.body || {};
  if (!title || !date || !time) return res.status(400).json({ message: "Faltan campos" });
  const item = await Task.create({ userId: req.userId, title, detail, date, time, status });
  res.status(201).json(item);
});

// PUT /tasks/:id -> actualizar todo
router.put("/:id", authRequired, async (req, res) => {
  const { title, detail = "", date, time, status } = req.body || {};
  if (!title || !date || !time) return res.status(400).json({ message: "Faltan campos" });

  const update = { title, detail, date, time };
  if (status) update.status = status;

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    update,
    { new: true, runValidators: true }
  );
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
  res.json(task);
});

// PUT /tasks/:id/status -> solo status
router.put("/:id/status", authRequired, async (req, res) => {
  const { status } = req.body || {};
  if (!["todo","doing","done"].includes(status)) {
    return res.status(400).json({ message: "Status inválido" });
  }
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
  res.json(task);
});

// DELETE /tasks/:id -> eliminar
router.delete("/:id", authRequired, async (req, res) => {
  const del = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!del) return res.status(404).json({ message: "Tarea no encontrada" });
  res.json({ ok: true });
});

module.exports = router;
