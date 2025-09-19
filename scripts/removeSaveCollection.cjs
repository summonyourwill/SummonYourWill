// scripts/removeSaveCollection.cjs
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

async function removeSaveCollection() {
  const db = mongoose.connection.db;
  
  try {
    const collection = db.collection('save');
    const count = await collection.countDocuments();
    if (count > 0) {
      await collection.drop();
      console.log(`✓ Colección 'save' eliminada (${count} documentos)`);
    } else {
      await collection.drop();
      console.log(`✓ Colección 'save' eliminada (estaba vacía)`);
    }
  } catch (e) {
    if (e.code === 26) { // NamespaceNotFound
      console.log(`⚠ Colección 'save' no existe`);
    } else {
      console.error(`❌ Error al eliminar colección 'save':`, e.message);
    }
  }
}

(async () => {
  await connectMongo();
  try {
    await removeSaveCollection();
    console.log('🎉 Limpieza de colección save completada');
  } finally {
    await disconnectMongo();
  }
})();
