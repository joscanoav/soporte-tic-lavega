const mongoose = require('mongoose');

/**
 * CODIGO_INCIDENCIAS
 * Catálogo maestro de tipos/categorías de incidencia.
 * Leído de la pizarra: ID_CODIGO INT PK, DESCRIPCION VARCHAR, etc.
 * Permite clasificar cada ticket creado.
 */
const CodigoIncidenciaSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      // Ej: 'HW', 'SW', 'RED', 'IMPRESORA', 'PROYECTOR'
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      // Ej: 'Hardware', 'Software', 'Red/Conectividad'
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'codigos_incidencias',
  }
);

module.exports = mongoose.model('CodigoIncidencia', CodigoIncidenciaSchema);
