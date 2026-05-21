const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * TABLA_USUARIOS + TABLA_LOGIN (unificadas)
 * Leído de la pizarra:
 *   TABLA USUARIOS: campos de perfil
 *   TABLA LOGIN:    credenciales de acceso
 *
 * Roles del sistema:
 *   - 'admin'    → gestión total
 *   - 'tecnico'  → resuelve incidencias
 *   - 'docente'  → abre incidencias, vinculado a REGISTRO_DOCENTES
 *   - 'alumno'   → abre incidencias (rol futuro)
 */
const UsuarioSchema = new mongoose.Schema(
  {
    // ── Identidad ──────────────────────────────────────────────
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellidos: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ── Credenciales (TABLA_LOGIN) ──────────────────────────────
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // nunca se devuelve en queries por defecto
    },
    rol: {
      type: String,
      enum: ['admin', 'tecnico', 'docente', 'alumno'],
      default: 'docente',
    },

    // ── Estado ──────────────────────────────────────────────────
    activo: {
      type: Boolean,
      default: true,
    },
    ultimoAcceso: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'usuarios',
  }
);

// ── Hash de contraseña antes de guardar ──────────────────────────
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Método de instancia: comparar contraseña ────────────────────
UsuarioSchema.methods.compararPassword = async function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
