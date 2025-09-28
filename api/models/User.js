/**
 * @file User.js
 * @description Modelo de usuario para autenticación y recuperación.
 */
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  age:       { type: Number, required: true, min: 10, max: 120 },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => /^\S+@\S+\.\S+$/.test(v),
      message: props => `${props.value} no es un email válido`
    }
  },
  passwordHash: { type: String, required: true },

  // Recuperación de contraseña
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

// Índice único en email
UserSchema.index({ email: 1 }, { unique: true });

// Ocultar datos sensibles al devolver JSON
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    return ret;
  }
});

module.exports = mongoose.model("User", UserSchema);
