// scripts/cleanupOldCollections.cjs
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

async function cleanupOldCollections() {
  const db = mongoose.connection.db;
  
  // Lista de colecciones antiguas a eliminar
  const oldCollections = ['villagechiefs', 'saves', 'partners'];
  
  for (const collectionName of oldCollections) {
    try {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      
      if (count > 0) {
        await collection.drop();
        console.log(`✓ Colección '${collectionName}' eliminada (${count} documentos)`);
      } else {
        console.log(`⚠ Colección '${collectionName}' no existe o está vacía`);
      }
    } catch (error) {
      console.log(`⚠ Error eliminando '${collectionName}':`, error.message);
    }
  }
  
  // Mostrar colecciones actuales
  const collections = await db.listCollections().toArray();
  console.log('\n📋 Colecciones actuales:');
  collections.forEach(col => {
    console.log(`  - ${col.name}`);
  });
}

(async () => {
  await connectMongo();
  try {
    await cleanupOldCollections();
    console.log('\n🎉 Limpieza completada');
  } finally {
    await disconnectMongo();
  }
})();
