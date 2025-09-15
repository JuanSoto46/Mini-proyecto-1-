/**
 * @file Task.js
 * @description Task mongoose model.
 */

const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 120 },
    detail: { type: String, default: "" },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:MM
    status: { type: String, enum: ["todo","doing","done"], default: "todo" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);