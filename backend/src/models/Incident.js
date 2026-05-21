const mongoose = require('mongoose');

const INCIDENT_STATUS     = ['PENDIENTE','EN_PROCESO','ESPERANDO_REPUESTO','RESUELTO','CERRADO'];
const INCIDENT_PRIORITY   = ['BAJA','MEDIA','ALTA','CRITICA'];
const INCIDENT_CATEGORIES = ['HARDWARE','SOFTWARE','RED','PROYECTOR','IMPRESORA','AUDIO','PANTALLA','OTRO'];

const statusHistorySchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    changedBy: { type: String, default: 'sistema' },
    comment:   { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const incidentSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true },
    reporterName: {
      type: String,
      required: [true, 'El nombre del profesor es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar 100 caracteres'],
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'El aula es obligatoria'],
    },
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', default: null },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: { values: INCIDENT_CATEGORIES, message: 'Categoría no válida: {VALUE}' },
    },
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [150, 'El título no puede superar 150 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [2000, 'La descripción no puede superar 2000 caracteres'],
    },
    priority: {
      type: String,
      enum: { values: INCIDENT_PRIORITY, message: 'Prioridad no válida: {VALUE}' },
      default: 'MEDIA',
    },
    status: {
      type: String,
      enum: { values: INCIDENT_STATUS, message: 'Estado no válido: {VALUE}' },
      default: 'PENDIENTE',
    },
    resolutionNotes: { type: String, trim: true, maxlength: 2000, default: null },
    assignedToAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    resolvedAt:      { type: Date, default: null },
    statusHistory:   [statusHistorySchema],
    aiSuggestion:    { type: String, default: null },
  },
  { timestamps: true, collection: 'incidents' }
);

incidentSchema.index({ status: 1 });
incidentSchema.index({ priority: 1 });
incidentSchema.index({ classroomId: 1 });
incidentSchema.index({ assignedToAdmin: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ status: 1, priority: 1 });

// FIX: un solo hook async unificado, sin next()
incidentSchema.pre('save', async function () {
  // Generar ticketNumber
  if (!this.ticketNumber) {
    const year   = new Date().getFullYear();
    const prefix = `TIC-${year}-`;
    const last   = await this.constructor
      .findOne({ ticketNumber: new RegExp(`^${prefix}`) })
      .sort({ ticketNumber: -1 })
      .select('ticketNumber')
      .lean();
    const nextNum = last ? parseInt(last.ticketNumber.split('-')[2], 10) + 1 : 1;
    this.ticketNumber = `${prefix}${String(nextNum).padStart(5, '0')}`;
  }
  // Marcar resolvedAt
  if (
    this.isModified('status') &&
    (this.status === 'RESUELTO' || this.status === 'CERRADO') &&
    !this.resolvedAt
  ) {
    this.resolvedAt = new Date();
  }
});

incidentSchema.statics.STATUS     = INCIDENT_STATUS;
incidentSchema.statics.PRIORITY   = INCIDENT_PRIORITY;
incidentSchema.statics.CATEGORIES = INCIDENT_CATEGORIES;

module.exports = mongoose.model('Incident', incidentSchema);
