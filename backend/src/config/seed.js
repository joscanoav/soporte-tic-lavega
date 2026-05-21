/**
 * seed.js — Datos iniciales para desarrollo
 * Ejecutar dentro del contenedor:
 *   docker exec tic_backend node src/config/seed.js
 */
require('dotenv').config();
const mongoose  = require('mongoose');
const Admin     = require('../models/Admin');
const Classroom = require('../models/Classroom');
const Device    = require('../models/Device');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/soporte_tic';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Conectado a MongoDB');

  await Promise.all([
    Admin.deleteMany({}),
    Classroom.deleteMany({}),
    Device.deleteMany({}),
  ]);
  console.log('🗑️   Colecciones limpiadas');

  // ── Admins ────────────────────────────────────────────────────
  await Admin.create([
    { name: 'Administrador',  email: 'admin@colegio.es',    password: 'Admin1234!',   role: 'superadmin' },
    { name: 'Carlos TIC',     email: 'tecnico@colegio.es',  password: 'Tecnico1234!', role: 'tecnico'    },
  ]);
  console.log('👤  2 admins creados');

  // ── Aulas ─────────────────────────────────────────────────────
  const aulas = await Classroom.create([
    { code: 'A101',      building: 'Edificio A', floor: 'Planta Baja',    description: 'Aula 101' },
    { code: 'A102',      building: 'Edificio A', floor: 'Planta Baja',    description: 'Aula 102' },
    { code: 'LAB-INF-1', building: 'Edificio B', floor: 'Primera Planta', description: 'Lab. Informática 1' },
    { code: 'LAB-INF-2', building: 'Edificio B', floor: 'Primera Planta', description: 'Lab. Informática 2' },
    { code: 'SALA-PROF', building: 'Edificio A', floor: 'Planta Baja',    description: 'Sala de Profesores' },
    { code: 'SECRETARIA',building: 'Edificio A', floor: 'Planta Baja',    description: 'Secretaría' },
  ]);
  console.log(`🏫  ${aulas.length} aulas creadas`);

  // ── Dispositivos de ejemplo ───────────────────────────────────
  await Device.create([
    { inventoryCode: 'PROY-001', type: 'PROYECTOR',          brand: 'Epson',  model: 'EB-W52',        classroomId: aulas[0]._id, status: 'OPERATIVO' },
    { inventoryCode: 'PROY-002', type: 'PROYECTOR',          brand: 'Epson',  model: 'EB-W52',        classroomId: aulas[1]._id, status: 'OPERATIVO' },
    { inventoryCode: 'PROY-003', type: 'PROYECTOR',          brand: 'BenQ',   model: 'MW550',         classroomId: aulas[2]._id, status: 'EN_REPARACION' },
    { inventoryCode: 'PORT-001', type: 'PORTATIL',           brand: 'HP',     model: 'ProBook 450',   classroomId: aulas[2]._id, status: 'OPERATIVO' },
    { inventoryCode: 'PORT-002', type: 'PORTATIL',           brand: 'HP',     model: 'ProBook 450',   classroomId: aulas[2]._id, status: 'OPERATIVO' },
    { inventoryCode: 'IMP-001',  type: 'IMPRESORA',          brand: 'Canon',  model: 'PIXMA G3470',   classroomId: aulas[4]._id, status: 'OPERATIVO' },
    { inventoryCode: 'ALT-001',  type: 'ALTAVOZ',            brand: 'JBL',    model: 'Control 1 Pro', classroomId: aulas[0]._id, status: 'OPERATIVO' },
  ]);
  console.log('💻  7 dispositivos creados');

  console.log('\n🎉  Seed completado con éxito');
  console.log('──────────────────────────────────────');
  console.log('  admin@colegio.es    →  Admin1234!');
  console.log('  tecnico@colegio.es  →  Tecnico1234!');
  console.log('──────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Error en seed:', err);
  process.exit(1);
});
