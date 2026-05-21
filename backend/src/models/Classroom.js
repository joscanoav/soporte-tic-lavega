const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'El código del aula es obligatorio'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    building: {
      type: String,
      required: [true, 'El edificio es obligatorio'],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'La planta es obligatoria'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede superar 200 caracteres'],
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'classrooms' }
);

// FIX: unique:true ya crea índice en code — solo dejamos el compuesto
classroomSchema.index({ building: 1, floor: 1 });

module.exports = mongoose.model('Classroom', classroomSchema);
