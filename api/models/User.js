/**
 * @file User.js
 * @description User mongoose model for auth.
 */

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true, min: 10, max: 120 },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);