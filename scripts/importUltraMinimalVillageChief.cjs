// scripts/importUltraMinimalVillageChief.cjs
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuración directa
const uri = 'mongodb://localhost:27017';
const dbName = 'SummonYourWill';

// Esquema
const VillageChiefSchema = new mongoose.Schema({
  _id: { type: String, default: 'single' }
}, { timestamps: true, strict: false });

// Modelo
const VillageChief = mongoose.models.VillageChief || mongoose.model('VillageChief', VillageChiefSchema, 'villagechief');

const MINIMAL_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\minimal';

async function connectMongo() {
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

async function upsertVillageChief(doc) {
  await VillageChief.replaceOne(
    { _id: 'single' },
    { ...doc, _id: 'single' },
    { upsert: true }
  );
}

(async () => {
  await connectMongo();
  try {
    console.log('📖 Importando villagechief ultra mínimo...');
    
    const data = fs.readFileSync(path.join(MINIMAL_BASE, 'villagechief_ultra_minimal.json'), 'utf8');
    const jsonData = JSON.parse(data);
    
    await upsertVillageChief(jsonData);
    console.log('✅ VillageChief importado exitosamente');
    
  } catch (error) {
    console.error('❌ Error importando villagechief:', error.message);
  } finally {
    await disconnectMongo();
  }
  console.log('🎉 Importación completada');
})();


