const mongoose = require('mongoose');

/**
 * INCIDENCIA  ← tabla central del sistema
 * Leído de la pizarra:
 *   - ID_INCIDENCIA INT PK
 *   - ID_INCIDENCIA_TIPO FK  → CodigoIncidencia
 *   - NOMBRE_DESCRIBE_INCIDENCIA  VARCHAR
 *   - NOMBRE_DESCRIBE_SOLUCIÓN    VARCHAR
 *   - RESULTADO_INCIDENCIA        IDA  ID
 *
 * Relaciones visibles en el diagrama de la pizarra:
 *   CODIGO_INCIDENCIAS  ──< INCIDENCIA >── TABLA_AULAS
 *                                    >── REGISTRO_DOCENTES / USUARIO
 */

// Sub-documento para el historial de cambios de estado (audit trail)
const HistorialEstadoSchema = new mongoose.Schema(
  {
    estado: { type: String, required: true },
    comentario: { type: String, trim: true },
    cambiadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fecha: { type: Date, default: Date.now },
  },
  { _id: false }
);

const IncidenciaSchema = new mongoose.Schema(
  {
    // ── Clasificación ───────────────────────────────────────────
    codigoIncidencia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodigoIncidencia',
      required: true,
    },

    // ── Descripción ─────────────────────────────────────────────
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // ── Ubicación ───────────────────────────────────────────────
    aula: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aula',
      required: true,
    },

    // ── Personas implicadas ─────────────────────────────────────
    // Quien reporta (docente, admin, alumno...)
    reportadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    // Técnico asignado para resolver (puede estar sin asignar inicialmente)
    asignadoA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },

    // ── Ciclo de vida ───────────────────────────────────────────
    estado: {
      type: String,
      enum: ['abierta', 'en_progreso', 'resuelta', 'cerrada', 'cancelada'],
      default: 'abierta',
    },
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta', 'critica'],
      default: 'media',
    },

    // ── Resolución ──────────────────────────────────────────────
    solucion: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    fechaResolucion: {
      type: Date,
      default: null,
    },

    // ── Audit trail ─────────────────────────────────────────────
    historialEstados: [HistorialEstadoSchema],

    // ── Adjuntos (fotos del problema, etc.) ─────────────────────
    adjuntos: [
      {
        nombre: String,
        url: String,    // ruta relativa dentro del contenedor
        tipo: String,   // MIME type
      },
    ],

    // ── Integración Gemini AI (futuro chatbot) ──────────────────
    // Sugerencia de solución generada por IA
    sugerenciaIA: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt = fecha apertura, updatedAt = última modificación
    collection: 'incidencias',
  }
);

// ── Índices para queries frecuentes ─────────────────────────────
IncidenciaSchema.index({ estado: 1 });
IncidenciaSchema.index({ aula: 1 });
IncidenciaSchema.index({ reportadoPor: 1 });
IncidenciaSchema.index({ asignadoA: 1 });
IncidenciaSchema.index({ codigoIncidencia: 1 });
IncidenciaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incidencia', IncidenciaSchema);
