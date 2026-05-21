const mongoose = require('mongoose');

/**
 * REGISTRO_DOCENTES
 * Leído de la pizarra:
 *   - NOMBRE_DE_RAMA INT FK
 *   - N_YEAR_CURSO  VINCULO 30
 *   - ESTADO_DE_CLASE_VINCULOS 30
 *   - OTRAS_FUNCIONES_OPCIONES LEN
 *
 * Extiende al Usuario con información académica específica del docente.
 * Relación: Un Usuario con rol='docente' tiene UN RegistroDocente.
 */
const RegistroDocenteSchema = new mongoose.Schema(
  {
    // ── FK hacia Usuario ────────────────────────────────────────
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      unique: true,
    },

    // ── Datos académicos ────────────────────────────────────────
    rama: {
      type: String,
      trim: true,
      // Ej: 'Informática', 'Administración', 'Electricidad'
    },
    anyoCurso: {
      type: String,
      trim: true,
      // Ej: '2025-2026'
    },
    // Aula(s) asignada(s) habitualmente a este docente
    aulasAsignadas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aula',
      },
    ],
    // Otras funciones u observaciones opcionales
    otrasFunciones: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'registro_docentes',
  }
);

module.exports = mongoose.model('RegistroDocente', RegistroDocenteSchema);
