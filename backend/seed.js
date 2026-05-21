const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./src/models/Admin');
const Classroom = require('./src/models/Classroom');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Admin.deleteMany({});
  await Classroom.deleteMany({});

  await Admin.create([
    { name: 'Administrador', email: 'admin@colegio.es', password: 'Admin1234!', role: 'superadmin' },
    { name: 'Tecnico TIC', email: 'tecnico@colegio.es', password: 'Tecnico1234!', role: 'tecnico' },
  ]);

  await Classroom.create([
    { code: 'AULA-TIC',  building: 'Edificio A', floor: 'Planta Baja', description: 'Aula de informatica' },
    { code: 'AULA-INF',  building: 'Edificio A', floor: 'Primera Planta', description: 'Aula de informatica 2' },
    { code: 'SEC-1A',    building: 'Edificio B', floor: 'Planta Baja', description: 'Secundaria 1A' },
    { code: 'SEC-2B',    building: 'Edificio B', floor: 'Primera Planta', description: 'Secundaria 2B' },
    { code: 'SALA-PROF', building: 'Edificio A', floor: 'Planta Baja', description: 'Sala de profesores' },
  ]);

  console.log('Datos creados correctamente');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
