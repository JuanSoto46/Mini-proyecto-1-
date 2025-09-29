/**
 * @file taskRoutes.js
 * @description Task endpoints with REST verbs.
 */
const express = require("express");
const Task = require("../models/Task");
const { authRequired } = require("../middlewares/auth");
const router = express.Router();

// GET /tasks -> get all user tasks
router.get("/", authRequired, async (req, res) => {
  try {
    const items = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// POST /tasks -> create a task
router.post("/", authRequired, async (req, res) => {
  try {
    const { title, detail = "", date, time, status = "todo" } = req.body || {};
    if (!title || !date || !time) {
      return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }
    const task = await Task.create({ title, detail, date, time, status, userId: req.userId });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// PUT /tasks/:id -> update entire task
router.put("/:id", authRequired, async (req, res) => {
  try {
    const { title, detail = "", date, time, status } = req.body || {};
    if (!title || !date || !time) {
      return res.status(400).json({ message: "Faltan campos" });
    }

    const update = { title, detail, date, time };
    if (status) update.status = status;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// PUT /tasks/:id/status -> update only the status
router.put("/:id/status", authRequired, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!["todo", "doing", "done"].includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// DELETE /tasks/:id -> delete a task
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const del = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!del) return res.status(404).json({ message: "Tarea no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
