/**
 * migrate-aulas.js
 * Copia la colección classrooms de Atlas al Docker local.
 * Ejecutar: docker exec tic_backend node migrate-aulas.js
 */
const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://traker616:M4sc4p1t0s%23%23@tic-lavega.qchnckj.mongodb.net/soporte_tic?appName=tic-lavega';
const LOCAL_URI = process.env.MONGO_URI;

async function migrate() {
  console.log('🌐 Conectando a Atlas...');
  const atlas = await mongoose.createConnection(ATLAS_URI).asPromise();
  const docs  = await atlas.db.collection('classrooms').find({}).toArray();
  console.log(`📥 ${docs.length} aulas leídas de Atlas`);
  await atlas.close();

  console.log('🐳 Conectando a MongoDB local...');
  const local = await mongoose.createConnection(LOCAL_URI).asPromise();
  await local.db.collection('classrooms').deleteMany({});
  await local.db.collection('classrooms').insertMany(docs);
  console.log(`✅ ${docs.length} aulas importadas en local`);
  await local.close();
}

migrate().catch(e => { console.error('❌', e.message); process.exit(1); });
