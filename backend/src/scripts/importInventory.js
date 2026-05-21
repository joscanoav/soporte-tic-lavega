/**
 * importInventory.js — Adaptado al Excel real del colegio
 *
 * HOJA 1 — Portátiles y equipos:
 *   ID Interno | Etiqueta Oficial | Nº Serie | Titularidad | Modelo/Tipo
 *   Dotación | Sistema Operativo | Ubicación | Estado | Conf.Software | Observaciones
 *
 * HOJA 2 — Proyectores, altavoces, tablets, impresoras:
 *   Tipo de recurso | Ubicación | Marca/Modelo | Estado | Nº Pasillo | Responsable | Observaciones
 *
 * USO: node src/scripts/importInventory.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');

const Device    = require('../models/Device');
const Classroom = require('../models/Classroom');

// ── Mapeo de ubicaciones del Excel → código de aula en MongoDB ──
// Añade aquí todas las ubicaciones que aparezcan en tu Excel
const UBICACION_MAP = {
  // Hoja 1
  'aula tic':          'AULA-TIC',
  'aula informática':  'AULA-INF',
  'aula steam':        'AULA-STEAM',
  'sala profesores':   'SALA-PROF',

  // Hoja 2 — edificio secundaria
  '1-a':  'SEC-1A',
  '1-b':  'SEC-1B',
  '1-c':  'SEC-1C',
  '2-a':  'SEC-2A',
  '2-b':  'SEC-2B',
  '2-c':  'SEC-2C',
  '3-a':  'SEC-3A',
  '3-b':  'SEC-3B',
  '3-c':  'SEC-3C',
};

// Normaliza la ubicación: quita espacios, pasa a minúsculas
// y extrae el código corto si el formato es "Aula 43 / 3-C  E.S.O"
function normalizeUbicacion(raw) {
  if (!raw) return null;
  const str = String(raw).trim().toLowerCase();

  // Si ya está en el mapa directo
  if (UBICACION_MAP[str]) return UBICACION_MAP[str];

  // Intentar extraer el código tipo "3-C" de strings como "Aula 43 / 3-C  E.S.O"
  const match = str.match(/\/\s*(\d+-[a-z])\s/i);
  if (match) {
    const code = match[1].toLowerCase();
    if (UBICACION_MAP[code]) return UBICACION_MAP[code];
  }

  // Devolver el string limpio como fallback (se creará el aula automáticamente)
  return str.toUpperCase().replace(/\s+/g, '-').substring(0, 20);
}

// ── Mapeo de tipos del Excel → enum de Device ──────────────────
function normalizeType(raw) {
  if (!raw) return 'OTRO';
  const str = String(raw).trim().toLowerCase();
  if (str.includes('proyector'))   return 'PROYECTOR';
  if (str.includes('altavoz') || str.includes('altavoces')) return 'ALTAVOZ';
  if (str.includes('impresora'))   return 'IMPRESORA';
  if (str.includes('tablet'))      return 'TABLET';
  if (str.includes('pantalla'))    return 'SMART_TV';
  if (str.includes('chromebook') || str.includes('probook') ||
      str.includes('hp') || str.includes('asus') || str.includes('lenovo')) return 'PORTATIL';
  if (str.includes('mezclas'))     return 'OTRO';
  return 'OTRO';
}

// ── Mapeo de estados ───────────────────────────────────────────
function normalizeStatus(raw) {
  if (!raw) return 'OPERATIVO';
  const str = String(raw).trim().toLowerCase();
  if (str === 'operativo') return 'OPERATIVO';
  if (str === 'averiado')  return 'AVERIADO';
  return 'OPERATIVO';
}

// ── Obtener o crear aula automáticamente ──────────────────────
async function getOrCreateClassroom(code, ubicacionRaw) {
  if (!code) return null;

  let classroom = await Classroom.findOne({ code: code.toUpperCase() });
  if (!classroom) {
    // Crear el aula si no existe
    classroom = await Classroom.create({
      code: code.toUpperCase(),
      building: 'Por definir',
      floor: 'Por definir',
      description: ubicacionRaw || code,
    });
    console.log(`  🏫 Aula creada: ${code}`);
  }
  return classroom;
}

// ── Importar Hoja 1 (portátiles y equipos) ────────────────────
async function importHoja1(workbook) {
  const sheet = workbook.Sheets['Hoja 1'];
  const rows  = XLSX.utils.sheet_to_json(sheet);

  console.log(`\n📋 Hoja 1: ${rows.length} dispositivos`);
  let created = 0, skipped = 0, errors = 0;

  for (const row of rows) {
    try {
      const ubicacionRaw = row['Ubicación'] || row['Ubicacion'] || '';
      const code = normalizeUbicacion(ubicacionRaw);
      const classroom = await getOrCreateClassroom(code, ubicacionRaw);
      if (!classroom) { skipped++; continue; }

      const inventoryCode = row['ID Interno'];
      if (!inventoryCode) { skipped++; continue; }

      const modeloTipo = String(row['Modelo / Tipo'] || row['Modelo/Tipo'] || '').trim();

      await Device.findOneAndUpdate(
        { inventoryCode: String(inventoryCode).trim().toUpperCase() },
        {
          inventoryCode:  String(inventoryCode).trim().toUpperCase(),
          serialNumber:   row['Nº Serie (S/N)'] || null,
          type:           normalizeType(modeloTipo),
          brand:          modeloTipo.includes('HP') ? 'HP' :
                          modeloTipo.includes('ASUS') || modeloTipo.includes('Asus') ? 'ASUS' :
                          modeloTipo.includes('Lenovo') ? 'Lenovo' :
                          modeloTipo.includes('Chromebook') ? 'Google' : null,
          model:          modeloTipo || null,
          classroomId:    classroom._id,
          assignedTo:     row['Dotación'] || null,
          status:         normalizeStatus(row['Estado']),
          notes:          row['Observaciones'] || null,
        },
        { upsert: true, new: true, runValidators: true }
      );
      created++;
    } catch (err) {
      console.error(`  ❌ Error: ${row['ID Interno']} → ${err.message}`);
      errors++;
    }
  }

  console.log(`  ✅ Importados: ${created} | ⚠️ Omitidos: ${skipped} | ❌ Errores: ${errors}`);
}

// ── Importar Hoja 2 (proyectores, altavoces, tablets...) ───────
async function importHoja2(workbook) {
  const sheet = workbook.Sheets['Hoja 2'];
  const rows  = XLSX.utils.sheet_to_json(sheet);

  console.log(`\n📋 Hoja 2: ${rows.length} dispositivos`);
  let created = 0, skipped = 0, errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const ubicacionRaw = row['Ubicación'] || row['Ubicacion'] || '';
      const code = normalizeUbicacion(ubicacionRaw);
      const classroom = await getOrCreateClassroom(code, ubicacionRaw);
      if (!classroom) { skipped++; continue; }

      const tipo = row['Tipo de recurso'] || 'OTRO';
      // Generar inventoryCode automático para hoja 2 (no tiene ID)
      const inventoryCode = `H2-${String(i + 1).padStart(4, '0')}`;
      const marcaModelo   = String(row['Marca/Modelo'] || '').trim();

      await Device.findOneAndUpdate(
        { inventoryCode },
        {
          inventoryCode,
          type:        normalizeType(tipo),
          brand:       marcaModelo.split(' ')[0] || null,
          model:       marcaModelo || null,
          classroomId: classroom._id,
          assignedTo:  row['Responsable'] || null,
          status:      normalizeStatus(row['Estado']),
          notes:       row['Observaciones'] || null,
        },
        { upsert: true, new: true, runValidators: true }
      );
      created++;
    } catch (err) {
      console.error(`  ❌ Error fila ${i + 2}: ${err.message}`);
      errors++;
    }
  }

  console.log(`  ✅ Importados: ${created} | ⚠️ Omitidos: ${skipped} | ❌ Errores: ${errors}`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Conectado a MongoDB Atlas');
 
  const filePath = path.resolve(__dirname, '../../inventario.xlsx');
  const workbook = XLSX.readFile(filePath);
  console.log(`📂 Leyendo: ${filePath}`);
 
  await importHoja1(workbook);
  await importHoja2(workbook);
 
  const totalDevices    = await Device.countDocuments();
  const totalClassrooms = await Classroom.countDocuments();
 
  console.log('\n══════════════════════════════════════');
  console.log('🎉 Importación completada');
  console.log(`   Dispositivos en BD: ${totalDevices}`);
  console.log(`   Aulas en BD:        ${totalClassrooms}`);
  console.log('══════════════════════════════════════');
 
  await mongoose.disconnect();
}
 
main().catch((err) => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
