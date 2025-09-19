// scripts/debugImport.cjs
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function debugImport() {
  try {
    // Verificar estructura de familiars.json
    console.log('🔍 Analizando familiars.json...');
    const familiarsData = JSON.parse(await fs.readFile(path.join(BASE, 'familiars.json'), 'utf8'));
    console.log('Tipo de datos:', Array.isArray(familiarsData) ? 'Array' : 'Object');
    console.log('Cantidad de elementos:', Array.isArray(familiarsData) ? familiarsData.length : 'N/A');
    
    if (Array.isArray(familiarsData)) {
      console.log('Primer elemento:', JSON.stringify(familiarsData[0], null, 2));
    } else {
      console.log('Claves del objeto:', Object.keys(familiarsData));
      if (familiarsData.familiars) {
        console.log('Cantidad en familiars.familiars:', familiarsData.familiars.length);
      }
    }

    // Verificar estructura de pets.json
    console.log('\n🔍 Analizando pets.json...');
    const petsData = JSON.parse(await fs.readFile(path.join(BASE, 'pets.json'), 'utf8'));
    console.log('Tipo de datos:', Array.isArray(petsData) ? 'Array' : 'Object');
    console.log('Cantidad de elementos:', Array.isArray(petsData) ? petsData.length : 'N/A');
    
    if (Array.isArray(petsData)) {
      console.log('Primer elemento:', JSON.stringify(petsData[0], null, 2));
    } else {
      console.log('Claves del objeto:', Object.keys(petsData));
      if (petsData.pets) {
        console.log('Cantidad en pets.pets:', petsData.pets.length);
      }
    }

    // Verificar estado actual de MongoDB
    console.log('\n🔍 Estado actual de MongoDB...');
    const db = mongoose.connection.db;
    const collections = ['heroes', 'pets', 'villains', 'familiars'];
    
    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`${collectionName}: ${count} documentos`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

(async () => {
  await connectMongo();
  try {
    await debugImport();
  } finally {
    await disconnectMongo();
  }
})();

