// scripts/cleanCollections.cjs
const mongoose = require('mongoose');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function cleanCollections() {
  const db = mongoose.connection.db;
  const collections = ['heroes', 'pets', 'villains', 'familiars', 'partner', 'villagechief'];

  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      if (count > 0) {
        await collection.deleteMany({});
        console.log(`✓ Colección '${collectionName}' limpiada (${count} documentos eliminados)`);
      } else {
        console.log(`⚠ Colección '${collectionName}' ya estaba vacía`);
      }
    } catch (e) {
      console.log(`⚠ Error al limpiar colección '${collectionName}':`, e.message);
    }
  }
}

(async () => {
  await connectMongo();
  try {
    await cleanCollections();
    console.log('\n🎉 Limpieza completada');
  } finally {
    await disconnectMongo();
  }
})();

