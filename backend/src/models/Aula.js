const mongoose = require('mongoose');

/**
 * TABLA_AULAS
 * Leído de la pizarra:
 *   - ID_CLASE INT PK
 *   - DESCRIPCION VARCHAR (nombre del aula)
 *   - NOMBRE_AULA FK  → referencia interna
 *   - BLOQUE_DE_PLANTA FK
 */
const AulaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Ej: 'Aula 101', 'Laboratorio Informática 1'
    },
    descripcion: {
      type: String,
      trim: true,
    },
    bloque: {
      type: String,
      trim: true,
      // Ej: 'Planta Baja', 'Primera Planta', 'Edificio B'
    },
    capacidad: {
      type: Number,
      default: 0,
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'aulas',
  }
);

module.exports = mongoose.model('Aula', AulaSchema);
