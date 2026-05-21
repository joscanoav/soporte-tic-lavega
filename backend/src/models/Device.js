const mongoose = require('mongoose');

/**
 * DEVICE — Inventario de dispositivos TIC
 * Referencia a Classroom. Referenciado por Incident.
 */

// Tipos de dispositivo permitidos
const DEVICE_TYPES = [
  'PROYECTOR',
  'ALTAVOZ',
  'PORTATIL',
  'IMPRESORA',
  'SMART_TV',
  'ORDENADOR_SOBREMESA',
  'TABLET',
  'ROUTER',
  'SWITCH',
  'CAMARA',
  'OTRO',
];

const DEVICE_STATUS = [
  'OPERATIVO',
  'EN_REPARACION',
  'AVERIADO',
  'BAJA',
  'ALMACEN',
];

const deviceSchema = new mongoose.Schema(
  {
    inventoryCode: {
      type: String,
      required: [true, 'El código de inventario es obligatorio'],
      unique: true,
      uppercase: true,
      trim: true,
      // Ej: 'PROY-001', 'PORT-042', 'IMP-007'
    },
    serialNumber: {
      type: String,
      trim: true,
      default: null,
      // Número de serie del fabricante
    },
    type: {
      type: String,
      required: [true, 'El tipo de dispositivo es obligatorio'],
      enum: {
        values: DEVICE_TYPES,
        message: 'Tipo de dispositivo no válido: {VALUE}',
      },
    },
    brand: {
      type: String,
      trim: true,
      // Ej: 'Epson', 'HP', 'Samsung', 'Canon'
    },
    model: {
      type: String,
      trim: true,
      // Ej: 'EB-W52', 'LaserJet Pro M404'
    },
    // FK → Classroom
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'El aula asignada es obligatoria'],
    },
    // Ubicación adicional dentro del aula (libre)
    assignedTo: {
      type: String,
      trim: true,
      // Ej: 'Pared frontal', 'Mesa profesor', 'Armario'
    },
    status: {
      type: String,
      enum: {
        values: DEVICE_STATUS,
        message: 'Estado no válido: {VALUE}',
      },
      default: 'OPERATIVO',
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    warrantyUntil: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Las notas no pueden superar 500 caracteres'],
    },
  },
  {
    timestamps: true,
    collection: 'devices',
  }
);

// ── Índices ────────────────────────────────────────────────────
deviceSchema.index({ inventoryCode: 1 });
deviceSchema.index({ classroomId: 1 });
deviceSchema.index({ type: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ classroomId: 1, type: 1 }); // "todos los proyectores del aula X"

// ── Exportar constantes para reutilizar en controllers ─────────
deviceSchema.statics.TYPES = DEVICE_TYPES;
deviceSchema.statics.STATUS = DEVICE_STATUS;

module.exports = mongoose.model('Device', deviceSchema);
