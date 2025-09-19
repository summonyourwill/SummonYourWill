// scripts/importStructureFixed.cjs
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

const FIXED_BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves\\structure_fixed';

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
    console.log('📖 Importando villagechief con estructura corregida...');
    
    const data = fs.readFileSync(path.join(FIXED_BASE, 'villagechief.json'), 'utf8');
    const jsonData = JSON.parse(data);
    
    await upsertVillageChief(jsonData);
    console.log('✅ VillageChief importado exitosamente');
    console.log(`   - _id: ${jsonData._id}`);
    console.log(`   - abilities: ${jsonData.abilities ? jsonData.abilities.length : 0} elementos`);
    console.log(`   - abilities.habilities excluido: ${!jsonData.abilities || !jsonData.abilities.habilities ? '✅ Sí' : '❌ No'}`);
    console.log(`   - abilities es array fijo de 100: ${jsonData.abilities && jsonData.abilities.length === 100 ? '✅ Sí' : '❌ No'}`);
    
  } catch (error) {
    console.error('❌ Error importando villagechief:', error.message);
  } finally {
    await disconnectMongo();
  }
  console.log('🎉 Importación completada');
})();

